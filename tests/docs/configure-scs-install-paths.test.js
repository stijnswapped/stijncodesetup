'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

const configureScsDocs = [
  'skills/configure-scs/SKILL.md',
  'docs/zh-CN/skills/configure-scs/SKILL.md',
  'docs/ja-JP/skills/configure-scs/SKILL.md',
];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function readConfigureScsDoc(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

console.log('\n=== Testing configure-scs install path guidance ===\n');

for (const relativePath of configureScsDocs) {
  test(`${relativePath} separates core and niche skill source roots`, () => {
    const content = readConfigureScsDoc(relativePath);

    assert.ok(
      content.includes('$SCS_ROOT/.agents/skills/<skill-name>'),
      'Expected configure-scs to document the core skill source root'
    );
    assert.ok(
      content.includes('$SCS_ROOT/skills/<skill-name>'),
      'Expected configure-scs to document the niche skill source root'
    );
  });

  test(`${relativePath} documents defensive copy form for trailing slash sources`, () => {
    const content = readConfigureScsDoc(relativePath);

    assert.ok(
      content.includes('${src%/}'),
      'Expected configure-scs to strip trailing slash before copying'
    );
    assert.ok(
      content.includes('$(basename "${src%/}")'),
      'Expected configure-scs to preserve the skill directory name explicitly'
    );
  });
}

if (failed > 0) {
  console.log(`\nFailed: ${failed}`);
  process.exit(1);
}

console.log(`\nPassed: ${passed}`);
