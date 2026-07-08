# SCS Deep Dive

This document explains what SCS installs, how the pieces relate, and when to
use each surface. The short README is for installation. This guide is for
understanding the system before you enable a large profile or publish a fork.

## What SCS Is

SCS is a portable workflow layer for coding agents. It packages reusable
instructions and runtime helpers so different harnesses can share the same
engineering practices:

| Surface | What it is | Primary path |
|---|---|---|
| Agents | Role-specific subagent instructions for planning, review, debugging, language work, and operations. | `agents/` |
| Skills | Reusable domain workflows and technical playbooks. | `skills/` |
| Commands | Slash-command compatible workflow entrypoints. | `commands/` |
| Rules | Always-follow coding, testing, security, and language guidelines. | `rules/` |
| Hooks | Event-driven automation around tool use, session start/end, compaction, and shell commands. | `hooks/`, `scripts/hooks/` |
| MCP configs | Suggested tool connector configuration. | `mcp-configs/`, `.mcp.json` |
| Install manifests | Profiles, modules, and components used by the selective installer. | `manifests/` |
| Control plane | Local SCS2 state, work items, sessions, and operator UI. | `scs2/`, `scripts/control-pane.js` |

The design goal is simple: install only the workflow surface needed for the
current harness, keep the files namespaced, and make uninstall/repair possible
through install-state.

## Install Paths

There are two normal install paths. Pick one.

| Path | Use when | Notes |
|---|---|---|
| Claude Code plugin | You want the easiest Claude Code setup. | Add the GitHub plugin, then install `scs@scs`. Do not also run the full manual installer. |
| Manual/selective installer | You want profile/module control or a non-Claude target. | Use `install.sh`, `install.ps1`, `npx scs-install`, or `node scripts/scs.js install`. |

Codex plugin marketplace setup is a CLI command, not a slash command:

```bash
codex plugin marketplace add stijnswapped/stijncodesetup
codex plugin list
node scripts/codex/check-plugin-cache.js
```

The Codex repo-marketplace path can register and discover `scs@scs`, but
runtime skill exposure from repo marketplaces is still unreliable upstream.
For Codex, prefer the selective installer until plugin cache behavior is
stable:

```bash
./install.sh --target codex --profile minimal
```

Current raw installer:

```bash
curl -fsSL https://raw.githubusercontent.com/stijnswapped/stijncodesetup/main/install.sh \
  | bash -s -- --target claude --profile full
```

Safer first pass:

```bash
curl -fsSL https://raw.githubusercontent.com/stijnswapped/stijncodesetup/main/install.sh \
  | bash -s -- --target claude --profile minimal --dry-run
```

## Profiles

Profiles are named install recipes. They are defined in
`manifests/install-profiles.json` and resolved through
`manifests/install-modules.json`.

| Profile | What it does | Best for |
|---|---|---|
| `minimal` | Low-context setup with core rules, agents, commands, platform config, and workflow support. Excludes hook runtime. | First install, cautious environments, debugging setup. |
| `core` | Baseline commands, hooks, platform configs, and quality workflow support. | Teams that want SCS automation but not all domain packs. |
| `developer` | General application-development profile. | Most active software projects. |
| `security` | Security-heavy review, scanning, and hardening guidance. | Auth, payments, secrets, MCP, user input, supply-chain work. |
| `research` | Research, synthesis, documentation, content, and market/investor workflows. | Investigation and writing-heavy projects. |
| `opencode` | OpenCode-specific command and workflow surface. | OpenCode users. |
| `full` | Everything classified by the manifest system. | Power users who understand the context and hook cost. |

Inspect profiles before installing:

```bash
node scripts/scs.js catalog profiles
node scripts/scs.js plan --target claude --profile developer
node scripts/scs.js plan --target claude --profile full --json
```

## Components And Modules

Components are user-facing selectors. Modules are lower-level manifest units.

Common components:

| Component | Includes |
|---|---|
| `baseline:rules` | Common and language rule packs. |
| `baseline:agents` | Shared agent definitions and `AGENTS.md` guidance. |
| `baseline:commands` | Slash-command compatible workflow docs. |
| `baseline:hooks` | Hook runtime configs and helper scripts. |
| `baseline:platform` | Harness configs, package manager setup, MCP defaults. |
| `baseline:workflow` | TDD, evaluation, verification, compaction, and quality workflows. |
| `capability:security` | Security review, scanning, threat modeling, MCP/tooling hardening. |
| `capability:database` | Database, migrations, persistence, query, and schema guidance. |
| `capability:research` | Research, API lookup, market intelligence, and synthesis. |
| `capability:content` | Writing, brand voice, investor, and launch content workflows. |
| `capability:optimization` | Performance, benchmarking, parallel execution, throughput. |
| `capability:media` | Video, image, motion, slides, and media generation workflows. |

Examples:

```bash
./install.sh --target claude --profile core --without baseline:hooks
./install.sh --target cursor --with capability:security --dry-run
./install.sh --target codex --modules agents-core,platform-configs
```

## Skills

Skills are the canonical workflow surface. Each skill is a directory with a
`SKILL.md` file and optional references, scripts, assets, or agent templates.

Skills answer "how should the agent do this work?" rather than "what command
should run?" They are used for both broad practices and specific domains.

For the complete per-skill catalog generated from the current repo, see
[SCS Skills And Hooks Catalog](SCS-SKILLS-HOOKS-CATALOG.md).

Major skill families:

| Family | Examples | Purpose |
|---|---|---|
| Engineering workflow | `tdd-workflow`, `verification-loop`, `strategic-compact`, `coding-standards` | Keep implementation disciplined and verifiable. |
| Review and security | `security-review`, `security-scan`, `production-audit`, `llm-trading-agent-security` | Find vulnerabilities, unsafe inputs, weak auth, secret exposure, and supply-chain issues. |
| Backend and APIs | `api-design`, `backend-patterns`, `mcp-server-patterns`, `deployment-patterns` | Build reliable service and integration layers. |
| Frontend and UI | `frontend-patterns`, `react-patterns`, `frontend-design-direction`, `motion-ui` | Build maintainable interfaces and interaction systems. |
| Language packs | `python-patterns`, `rust-patterns`, `golang-testing`, `swift-concurrency-6-2` | Language-specific coding, testing, and review conventions. |
| Data and ML | `mle-workflow`, `database-migrations`, `postgres-patterns`, `mysql-patterns` | Data contracts, persistence, ML evaluation, and operational quality. |
| Agent operations | `agent-sort`, `agentic-os`, `continuous-learning-v2`, `team-agent-orchestration` | Multi-agent planning, install tailoring, observer workflows, and coordination. |
| Research and content | `deep-research`, `market-research`, `brand-voice`, `content-engine` | Source-grounded research and publishing workflows. |
| Media | `video-editing`, `fal-ai-media`, `frontend-slides`, `remotion-video-creation` | Visual, video, slides, and generated media pipelines. |

Install specific skills:

```bash
./install.sh --target claude --skills tdd-workflow,security-review,api-design
node scripts/scs.js catalog components --family capability
```

How to read a skill:

1. Open `skills/<skill-id>/SKILL.md`.
2. Read the trigger conditions first.
3. If the skill references `references/`, read only the relevant reference file.
4. If it includes `scripts/`, prefer running the provided script over copying logic.
5. Keep skills in `skills/` first; use `commands/` only as compatibility shims.

## Agents

Agents are specialized instruction files for delegated work. They describe a
role, when to use it, and what output shape to produce.

Common agent categories:

| Category | Agents | Typical use |
|---|---|---|
| Planning and architecture | `planner`, `architect`, `spec-miner` | Scope complex changes, design systems, extract brownfield specs. |
| Review | `code-reviewer`, `security-reviewer`, language reviewers | Find bugs, maintainability issues, and security risks. |
| Build resolution | `build-error-resolver`, language build resolvers | Fix compiler, dependency, type, and migration failures. |
| Testing | `tdd-guide`, `e2e-runner`, `pr-test-analyzer` | Drive TDD, E2E checks, and failed-test analysis. |
| Operations | `loop-operator`, `harness-optimizer`, `doc-updater` | Monitor autonomous loops, tune harness config, update docs. |
| Language specialists | `typescript-reviewer`, `python-reviewer`, `rust-reviewer`, `go-reviewer`, and others | Apply language-specific review standards. |

Agents are most useful when the main agent needs a second pass, parallel
review, or a role with narrower judgment.

## Commands

Commands are markdown workflow entrypoints. They exist for slash-command
compatibility and user ergonomics. Long-term, new workflow knowledge should
land in `skills/` first.

Important command groups:

| Group | Commands | What they do |
|---|---|---|
| Planning | `/plan`, `/orchestrate`, `/multi-execute` | Break work into steps, coordinate parallel agents, execute structured plans. |
| Quality | `/tdd`, `/test`, `/code-review`, `/quality-gate` | Drive tests, review, and quality checks. |
| Security | `/security-review`, `/security-scan`, `/agent-audit` | Review auth/input/secrets/MCP/tool surfaces. |
| Debugging | `/build-fix`, `/debug`, `/learn-eval` | Resolve failures and extract reusable lessons. |
| Docs | `/update-docs`, `/doc`, `/scs-guide` | Update docs, navigate SCS, produce summaries. |
| Operations | `/auto-update`, `/cost-report`, `/pm2`, `/work-items` | Maintain installs, report cost, manage services and linked work. |

Inspect generated command registry:

```bash
npm run command-registry:check
node scripts/scs.js catalog show workflow-quality
```

## Rules

Rules are always-follow guidance installed into harness-specific locations.
They are intentionally smaller than skills and are meant to shape default
behavior.

Rule categories:

| Rule pack | Purpose |
|---|---|
| `rules/common` | Core agent behavior, code review, security, testing, git workflow, performance, and hooks guidance. |
| `rules/typescript`, `rules/python`, `rules/go`, etc. | Language-specific conventions. |
| `rules/web`, `rules/react`, `rules/vue`, etc. | Frontend framework and web product guidance. |
| `rules/*/security.md` | Common security requirements for the language/framework. |
| `rules/*/testing.md` | Testing expectations and verification patterns. |

For manual Claude installs, keep rules under the SCS namespace:

```bash
mkdir -p ~/.claude/rules/scs
cp -r rules/common ~/.claude/rules/scs/
cp -r rules/typescript ~/.claude/rules/scs/
```

## Hooks

Hooks are runtime automation triggered by harness events. They can add context,
guard risky actions, record session data, or transform shell commands.

For the complete hook-by-hook table generated from `hooks/hooks.json`, see
[SCS Skills And Hooks Catalog](SCS-SKILLS-HOOKS-CATALOG.md).

Primary hook event types:

| Event | Purpose |
|---|---|
| `SessionStart` | Load recent context, project type, learned skills, aliases, and observer lease metadata. |
| `SessionEnd` | Summarize transcript, write session state, and stop observer leases when appropriate. |
| `PreToolUse` | Inspect tool calls before execution, including shell and MCP health checks. |
| `PostToolUse` | Observe results, extract PR URLs, update counters, and record telemetry-like session facts. |
| `PreCompact` | Save context before compaction. |
| Shell dispatch | Transform selected shell commands, detect dev servers, and route supported workflows. |

Important hook scripts:

| Script | What it does |
|---|---|
| `scripts/hooks/session-start.js` | Builds SessionStart additional context and observer session leases. |
| `scripts/hooks/session-end.js` | Writes session summaries and state after a session. |
| `scripts/hooks/evaluate-session.js` | Looks for repeated patterns and learning opportunities. |
| `scripts/hooks/mcp-health-check.js` | Blocks unhealthy MCP tool calls when configured. |
| `scripts/hooks/plugin-hook-bootstrap.js` | Safely bootstraps plugin hooks with resolved plugin root paths. |
| `scripts/hooks/post-bash-hooks.js` | Handles shell command observations and follow-up behavior. |
| `scripts/hooks/pre-bash-dispatcher.js` | Routes pre-shell command checks and transforms. |

Hook safety rules:

- Do not manually paste raw `hooks/hooks.json` into random harness settings.
- Use `--modules hooks-runtime` or a profile that includes hooks.
- Start with `--dry-run`.
- Use `minimal` or `--without baseline:hooks` if you want low context and no hook runtime.
- Keep hook-managed files namespaced and uninstall through install-state.

Install only hooks:

```bash
./install.sh --target claude --modules hooks-runtime --dry-run
./install.sh --target claude --modules hooks-runtime
```

## MCP Configs

MCP config files define recommended external tool connectors. SCS treats MCP
configuration as install-time scaffolding, not a live toggle.

| Surface | Meaning |
|---|---|
| `.mcp.json` | Plugin-root MCP config for Codex-style plugin surfaces. |
| `mcp-configs/mcp-servers.json` | Shared MCP server configuration bundle. |
| `SCS_DISABLED_MCPS` | Install/sync filter used by SCS tooling. |
| Claude `/mcp` command | Live Claude Code runtime enable/disable surface. |

Do not confuse `SCS_DISABLED_MCPS` with live Claude Code runtime state. Use the
harness runtime controls for runtime toggles.

## SCS2 And Control Plane

SCS2 is the local operational state layer. It tracks sessions, work items,
memory-like knowledge, and operator status.

Important entrypoints:

```bash
node scripts/scs.js status --json
node scripts/scs.js sessions
node scripts/scs.js work-items claim --owner codex
node scripts/scs.js control-pane --port 8765 --read-only
```

The control pane is a local HTTP UI. By default, keep it local and read-only
unless you intentionally enable actions.

## Install State, Doctor, Repair, Uninstall

Managed installs write install-state so SCS can inspect, repair, and uninstall
only files it owns.

| Command | Purpose |
|---|---|
| `node scripts/scs.js list-installed` | Show install-state records. |
| `node scripts/scs.js doctor` | Report missing or drifted managed files. |
| `node scripts/scs.js repair --dry-run` | Preview restoring drifted files. |
| `node scripts/uninstall.js --dry-run` | Preview uninstall. |
| `node scripts/uninstall.js --target claude` | Remove managed files for a target. |

SCS only removes files recorded in its install-state. User files and unmanaged
files should be preserved.

## Repository Maintenance

Useful checks before publishing:

```bash
npm run catalog:check
npm run command-registry:check
node scripts/ci/validate-agents.js
node scripts/ci/validate-commands.js
node scripts/ci/validate-rules.js
node scripts/ci/validate-skills.js
node scripts/ci/validate-hooks.js
node scripts/ci/validate-install-manifests.js
npm test
```

Recommended pre-push scan for stale old-brand identifiers:

```bash
rg -n "old-brand-name|oldRepoName|oldFunctionPrefix" \
  -g '!node_modules/**' -g '!.git/**'
```

Expected legitimate exceptions for broad lowercase legacy-name scans:

- `keccak256` skill names and examples.
- Lockfile checksums.
- Natural-language words in translated docs, especially Spanish words such as
  `correcciones` and `secciones`.

## Practical Starting Points

For a normal Claude Code setup:

```bash
curl -fsSL https://raw.githubusercontent.com/stijnswapped/stijncodesetup/main/install.sh \
  | bash -s -- --target claude --profile minimal --dry-run
curl -fsSL https://raw.githubusercontent.com/stijnswapped/stijncodesetup/main/install.sh \
  | bash -s -- --target claude --profile minimal
```

For a larger project:

```bash
./install.sh --target claude --profile developer --dry-run
./install.sh --target claude --profile developer
```

For security-heavy work:

```bash
./install.sh --target claude --profile security --dry-run
```

For a targeted skill install:

```bash
./install.sh --target claude --skills tdd-workflow,security-review,api-design
```

For Codex:

```bash
./install.sh --target codex --profile minimal --dry-run
./install.sh --target codex --profile minimal
```

## Mental Model

Use this order when deciding what to install:

1. Pick the target harness.
2. Pick the smallest profile that gives the desired behavior.
3. Add capabilities with `--with`.
4. Remove hook runtime with `--without baseline:hooks` if you want low-context behavior.
5. Dry-run.
6. Install.
7. Use `doctor`, `repair`, and `uninstall` instead of manually deleting managed files.
