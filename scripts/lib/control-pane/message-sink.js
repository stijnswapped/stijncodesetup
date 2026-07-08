'use strict';

/**
 * Concrete message sink for proximity triggers: delivers a session-to-session
 * message through the canonical writer, the `scs-tui messages send` CLI. The CLI
 * owns the scs2 session DB (the `messages` table the control pane reads), so we
 * shell out to it rather than writing the SQLite directly and racing the daemon.
 *
 * Best-effort: if the binary is not found / the command fails, the call throws,
 * and the dispatcher counts it as skipped — proximity never blocks on delivery.
 * The command runner and binary path are injectable for tests.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Proximity trigger type → scs-tui message kind (value_enum on `--kind`).
// A steer/hold is a collision warning; a transmit is a "what are you doing" query.
const KIND_BY_TYPE = {
  proximity_steer: 'conflict',
  proximity_hold: 'conflict',
  proximity_transmit: 'query'
};

/**
 * Resolve the scs-tui binary: explicit override, env var, a built target in the
 * repo, then the bare name (hope it's on PATH).
 */
function resolveScsBin(deps = {}) {
  if (deps.binPath) return deps.binPath;
  if (process.env.SCS_TUI_BIN && process.env.SCS_TUI_BIN.trim()) return process.env.SCS_TUI_BIN.trim();
  const repoRoot = deps.repoRoot || path.join(__dirname, '..', '..', '..');
  for (const rel of ['scs2/target/release/scs-tui', 'scs2/target/debug/scs-tui']) {
    const candidate = path.join(repoRoot, rel);
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* ignore */
    }
  }
  return 'scs-tui';
}

/**
 * Build the `messages send` argv for a proximity message.
 */
function buildSendArgs({ fromSession, toSession, content, msgType }) {
  const kind = KIND_BY_TYPE[msgType] || 'query';
  return ['messages', 'send', '--from', String(fromSession), '--to', String(toSession), '--kind', kind, '--text', String(content)];
}

/**
 * Create a `sendMessage({ fromSession, toSession, content, msgType })` sink that
 * delivers via `scs-tui messages send`. Inject `runCommand(bin, args)` for tests.
 */
function createScsMessageSink(deps = {}) {
  const run = deps.runCommand || ((bin, args) => execFileSync(bin, args, { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'] }));
  const bin = resolveScsBin(deps);
  return function sendMessage(message) {
    run(bin, buildSendArgs(message));
  };
}

module.exports = {
  KIND_BY_TYPE,
  resolveScsBin,
  buildSendArgs,
  createScsMessageSink
};
