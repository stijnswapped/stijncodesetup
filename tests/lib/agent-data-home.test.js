/**
 * Tests for scripts/lib/agent-data-home.js
 *
 * Run with: node tests/lib/agent-data-home.test.js
 *
 * Cwd / project context: many cases use `withIsolatedCwd()` (empty temp dir, no
 * `.cursor/`) so results do not depend on running inside a dogfooded SCS repo.
 * When this repo has `.cursor/scs-agent-data.json` installed, `resolveAgentDataHome()`
 * from the real project root intentionally resolves to `~/.cursor/scs` — see the
 * dedicated test below; do not expect `~/.claude` while cwd is the SCS tree.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function withEnv(overrides, fn) {
  const previous = {};
  for (const key of Object.keys(overrides)) {
    previous[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }

  try {
    fn();
  } finally {
    for (const key of Object.keys(previous)) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
    delete require.cache[require.resolve('../../scripts/lib/agent-data-home')];
  }
}

/**
 * Run fn with cwd in an empty directory (no .cursor/) so resolveProjectDir() does
 * not pick up the SCS repo's installed agent-data config.
 */
function withIsolatedCwd(fn) {
  const isolatedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scs-agent-data-home-'));
  const originalCwd = process.cwd();
  try {
    process.chdir(isolatedDir);
    return fn(isolatedDir);
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(isolatedDir, { recursive: true, force: true });
  }
}

function runTests() {
  console.log('\n=== Testing agent-data-home.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('defaults to ~/.claude outside Cursor (isolated cwd)', () => {
    withIsolatedCwd(() => {
      withEnv({
        SCS_AGENT_DATA_HOME: undefined,
        CURSOR_VERSION: undefined,
        CURSOR_PROJECT_DIR: undefined,
      }, () => {
        const agentDataHome = require('../../scripts/lib/agent-data-home');
        const home = os.homedir();
        assert.strictEqual(
          agentDataHome.resolveAgentDataHome(),
          path.join(home, '.claude')
        );
      });
    });
  })) passed++; else failed++;

  if (test('resolveAgentDataHome uses projectDir + .cursor/scs-agent-data.json', () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scs-agent-data-home-project-'));
    const cursorDir = path.join(projectDir, '.cursor');
    fs.mkdirSync(cursorDir, { recursive: true });
    fs.writeFileSync(
      path.join(cursorDir, 'scs-agent-data.json'),
      JSON.stringify({ agentDataHome: '~/.cursor/scs' }),
      'utf8'
    );

    try {
      withIsolatedCwd(() => {
        withEnv({
          SCS_AGENT_DATA_HOME: undefined,
          CURSOR_VERSION: undefined,
          CURSOR_PROJECT_DIR: undefined,
        }, () => {
          const agentDataHome = require('../../scripts/lib/agent-data-home');
          assert.strictEqual(
            agentDataHome.resolveAgentDataHome({ projectDir }),
            path.join(os.homedir(), '.cursor', 'scs')
          );
        });
      });
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('defaults to ~/.cursor/scs in Cursor hook runtime (isolated cwd)', () => {
    withIsolatedCwd(() => {
      withEnv({
        SCS_AGENT_DATA_HOME: undefined,
        CURSOR_VERSION: '1.0.0',
        CURSOR_PROJECT_DIR: undefined,
      }, () => {
        const agentDataHome = require('../../scripts/lib/agent-data-home');
        const home = os.homedir();
        assert.strictEqual(
          agentDataHome.resolveAgentDataHome(),
          path.join(home, '.cursor', 'scs')
        );
      });
    });
  })) passed++; else failed++;

  if (test('honors SCS_AGENT_DATA_HOME over Cursor default', () => {
    const override = path.join(os.tmpdir(), `scs-override-${Date.now()}`);
    withEnv({
      SCS_AGENT_DATA_HOME: override,
      CURSOR_VERSION: '1.0.0',
    }, () => {
      const agentDataHome = require('../../scripts/lib/agent-data-home');
      assert.strictEqual(agentDataHome.resolveAgentDataHome(), path.resolve(override));
    });
  })) passed++; else failed++;

  if (test('reads project scs-agent-data.json config file', () => {
    const tmpDir = path.join(os.tmpdir(), `scs-agent-data-home-read-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    const configPath = path.join(tmpDir, 'scs-agent-data.json');
    const customHome = path.join(tmpDir, 'data-root');
    fs.writeFileSync(
      configPath,
      JSON.stringify({ agentDataHome: customHome }),
      'utf8'
    );

    try {
      withEnv({
        SCS_AGENT_DATA_HOME: undefined,
        CURSOR_VERSION: undefined,
      }, () => {
        const agentDataHome = require('../../scripts/lib/agent-data-home');
        assert.strictEqual(
          agentDataHome.readProjectConfigAt(configPath),
          path.resolve(customHome)
        );
      });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('resolves relative agentDataHome against project root, not cwd', () => {
    const stamp = Date.now();
    const projectDir = path.join(os.tmpdir(), `scs-agent-data-home-relative-${stamp}`);
    const cursorDir = path.join(projectDir, '.cursor');
    const otherCwd = path.join(os.tmpdir(), `scs-agent-data-home-other-cwd-${stamp}`);
    fs.mkdirSync(cursorDir, { recursive: true });
    fs.mkdirSync(otherCwd, { recursive: true });
    const configPath = path.join(cursorDir, 'scs-agent-data.json');
    const expectedHome = path.join(projectDir, '.scs-data');
    fs.writeFileSync(
      configPath,
      JSON.stringify({ agentDataHome: '.scs-data' }),
      'utf8'
    );

    const originalCwd = process.cwd();
    try {
      process.chdir(otherCwd);
      withEnv({
        SCS_AGENT_DATA_HOME: undefined,
        CURSOR_VERSION: undefined,
        CURSOR_PROJECT_DIR: projectDir,
      }, () => {
        const agentDataHome = require('../../scripts/lib/agent-data-home');
        assert.strictEqual(agentDataHome.readProjectConfigAt(configPath), expectedHome);
        assert.strictEqual(
          agentDataHome.resolveAgentDataHome({ projectDir }),
          expectedHome
        );
      });
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(projectDir, { recursive: true, force: true });
      fs.rmSync(otherCwd, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('readProjectConfigAt logs parse failures', () => {
    const tmpDir = path.join(os.tmpdir(), `scs-agent-data-home-log-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    const configPath = path.join(tmpDir, 'scs-agent-data.json');
    fs.writeFileSync(configPath, '{ invalid json', 'utf8');

    const originalError = console.error;
    const messages = [];
    console.error = (...args) => {
      messages.push(args.join(' '));
    };

    try {
      withEnv({
        SCS_AGENT_DATA_HOME: undefined,
        CURSOR_VERSION: undefined,
      }, () => {
        const agentDataHome = require('../../scripts/lib/agent-data-home');
        assert.strictEqual(agentDataHome.readProjectConfigAt(configPath), null);
        assert.ok(
          messages.some(message => message.includes(configPath)),
          'Expected config path in error log'
        );
      });
    } finally {
      console.error = originalError;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('ensureAgentDataHomeEnv sets process.env when unset', () => {
    withEnv({
      SCS_AGENT_DATA_HOME: undefined,
      CURSOR_VERSION: '1.0.0',
    }, () => {
      const agentDataHome = require('../../scripts/lib/agent-data-home');
      const resolved = agentDataHome.ensureAgentDataHomeEnv();
      assert.ok(process.env.SCS_AGENT_DATA_HOME);
      assert.strictEqual(process.env.SCS_AGENT_DATA_HOME, resolved);
    });
  })) passed++; else failed++;

  console.log(`\n=== Test Results ===\nPassed: ${passed}\nFailed: ${failed}\n`);
  if (failed > 0) process.exit(1);
}

runTests();
