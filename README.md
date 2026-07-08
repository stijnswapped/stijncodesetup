# SCS Universal

SCS Universal is a portable agent workflow bundle for modern coding harnesses.
It packages agents, skills, commands, hooks, rules, install manifests, and MCP
defaults so a project can install the same operating surface into Claude Code,
Codex, Cursor, OpenCode, Gemini, Qwen, Zed, Hermes, Kimi, OpenClaw, and related
local workflows.

**Version:** 2.0.0

Current catalog:

| Surface | Count | Location |
|---|---:|---|
| Agents | 67 | `agents/` |
| Skills | 277 | `skills/` |
| Commands | 93 | `commands/` |
| Rule packs | 22 | `rules/` |
| Hook configs | 2 | `hooks/` |
| MCP configs | 1 | `mcp-configs/` |

After installation, the harness has access to 67 agents, 277 skills, and 93 commands.

Catalog verification compatibility:

|-- agents/ # 67 specialized subagents for delegation

| Surface | Count |
|---|---|
| Agents | 67 agents |
| Skills | 277 skills |
| Commands | 93 commands |

| Surface | Total | Claude | Cursor | OpenCode |
|---|---:|---|---|---:|
| Agents | 67 | Shared (AGENTS.md) | Shared (AGENTS.md) | 12 |
| Skills | 277 | Shared | 10 (native format) | 37 |
| Commands | 93 | Shared | Instruction-based | 93 |

## Clean Repository Setup

This checkout has been stripped of the previous Git history and GitHub workflow
metadata. Start a new repository from this working tree:

```bash
git init
git add .
git commit -m "chore: initial clean SCS import"
git branch -M main
git remote add origin git@github.com:StijnCodeSetup/StijnCodeSetup.git
git push -u origin main
```

The raw installer default in `install.sh` is already set to:

```bash
SCS_REPO_DEFAULT="StijnCodeSetup/StijnCodeSetup"
```

If you publish under a different owner or repository name later, update
`SCS_REPO_DEFAULT` in `install.sh` and the repository metadata in
`package.json`, plugin manifests, and `agent.yaml`.

## Install

### Pick one path only

**Recommended default:** install the Claude Code plugin:

```text
/plugin marketplace add https://github.com/StijnCodeSetup/StijnCodeSetup
/plugin install scs@scs
/plugin list scs@scs
/scs:plan "Add user authentication"
```

**Do not stack install methods.** If you use `/plugin install scs@scs`, do not run the full installer afterwards. If you choose the manual installer path with `--profile full`, stop there. Do not also run `/plugin install`.

### Find the right components first

```bash
npx scs consult "security reviews" --target claude
node scripts/scs.js consult "security reviews" --target claude
```

It returns matching components, related profiles, and preview/install commands.

### Low-context / no-hooks path

```bash
./install.sh --profile minimal --target claude
npx scs-install --profile minimal --target claude
./install.sh --profile core --without baseline:hooks --target claude
```

This profile intentionally excludes `hooks-runtime`.

If you choose this path, stop there. Do not also run `/plugin install`.

Raw GitHub install from the new repository:

```bash
curl -fsSL https://raw.githubusercontent.com/StijnCodeSetup/StijnCodeSetup/main/install.sh \
  | bash -s -- --target claude --profile full
```

Raw GitHub install from another fork without editing `install.sh` first:

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/install.sh \
  | SCS_REPO=<owner>/<repo> bash -s -- --target claude --profile full
```

Local install from a clone:

```bash
./install.sh --target claude --profile developer
```

Dry-run any plan before copying files:

```bash
./install.sh --target codex --profile full --dry-run
./install.sh --target cursor --with capability:security --without baseline:hooks --dry-run
```

### Plugin, Manual, And Hook Boundaries

Manual Claude skill installs should copy skills as direct children of `~/.claude/skills/`:

```bash
mkdir -p ~/.claude/skills
cp -r skills/tdd-workflow ~/.claude/skills/
cp -r skills/security-review ~/.claude/skills/
```

Start with `rules/common` plus one language or framework pack you actually use. Plugin-path and managed installer rules live under the SCS-owned namespace:

```bash
mkdir -p ~/.claude/rules/scs
cp -r rules/common ~/.claude/rules/scs/
cp -r rules/typescript ~/.claude/rules/scs/
```

Do not copy the raw repo `hooks/hooks.json` into `~/.claude/settings.json` or `~/.claude/hooks/hooks.json`. Use the supported hook installer:

```bash
bash ./install.sh --target claude --modules hooks-runtime
pwsh -File .\install.ps1 --target claude --modules hooks-runtime
```

On Windows, Claude Code config is under `%USERPROFILE%\\.claude`.

To clean up a plugin install, remove the plugin from Claude Code first, then inspect managed install state before reinstalling.

### Reset / Uninstall SCS

```bash
node scripts/scs.js list-installed
node scripts/scs.js doctor
node scripts/uninstall.js --dry-run
node scripts/uninstall.js --target claude
```

SCS only removes files recorded in its install-state.

### MCP Runtime Scope

Use `/mcp` for Claude Code runtime disables; Claude Code persists those choices in `~/.claude.json`.

`SCS_DISABLED_MCPS` is an SCS install/sync filter, not a live Claude Code toggle.

### Cursor Notes

Cursor agent files are namespaced as `.cursor/agents/scs-*.md`. Cursor-native loading behavior can vary by Cursor build. SCS does not install root `AGENTS.md` into `.cursor/`.

### Release And Hermes Links

- Hermes setup: [docs/HERMES-SETUP.md](docs/HERMES-SETUP.md)
- Current release notes: [docs/releases/2.0.0/release-notes.md](docs/releases/2.0.0/release-notes.md)

## Install Flags

All flags are forwarded to `scripts/install-apply.js`.

| Flag | Purpose |
|---|---|
| `--target <id>` | Select install target. Default is `claude`. |
| `--profile <name>` | Install a named profile from `manifests/install-profiles.json`. |
| `--modules <ids>` | Install explicit module IDs from `manifests/install-modules.json`. |
| `--with <component>` | Include a user-facing component such as `capability:security`. Repeatable. |
| `--without <component>` | Exclude a user-facing component. Repeatable. |
| `--skills <ids>` | Install one or more skill directories by ID, comma-separated. |
| `--locale <code>` | Install translated docs for Claude targets. |
| `--config <path>` | Load install intent from `scs-install.json`. |
| `--dry-run` | Print the install plan without copying files. |
| `--json` | Emit machine-readable plan/result JSON. |
| `--help` | Print installer help. |

Raw bootstrap environment variables:

| Variable | Purpose |
|---|---|
| `SCS_REPO` | GitHub `owner/repo` used by raw installs. Overrides `SCS_REPO_DEFAULT`. |
| `SCS_REF` | Branch, tag, or ref to download. Default is `main`. |
| `SCS_ARCHIVE_URL` | Full source archive URL. Overrides `SCS_REPO` and `SCS_REF`. |
| `SCS_KEEP_TEMP=1` | Keep the downloaded temp directory for debugging. |

## Targets

| Target | Installs into |
|---|---|
| `claude` | `~/.claude/` with managed SCS rules and skills. |
| `claude-project` | `./.claude/` for project-local Claude setup. |
| `cursor` | `./.cursor/` rules, hooks, and bundled Cursor configs. |
| `antigravity` | `./.agent/` rules, workflows, skills, and agents. |
| `codex` | `~/.codex/` shared agents and config. |
| `gemini` | `./.gemini/` project-local Gemini config. |
| `opencode` | `~/.opencode/` shared commands, hooks, and config. |
| `codebuddy` | `./.codebuddy/` commands, agents, skills, and flattened rules. |
| `joycode` | `./.joycode/` commands, agents, skills, and flattened rules. |
| `qwen` | `~/.qwen/` commands, agents, skills, rules, and config. |
| `zed` | `./.zed/` settings, commands, agents, skills, and flattened rules. |
| `hermes` | `~/.hermes/` shared rules, skills, and commands. |
| `kimi` | `./.kimi/` shared rules, skills, and commands. |
| `openclaw` | `~/.openclaw/` shared rules, skills, and commands. |

## Profiles

| Profile | Purpose |
|---|---|
| `minimal` | Low-context Claude Code setup with rules, agents, commands, platform configs, and workflow support, without hook runtime. |
| `opencode` | Default OpenCode setup with commands, platform configs, and workflow support. Hooks are opt-in. |
| `core` | Minimal harness baseline with commands, hooks, platform configs, and quality workflow support. |
| `developer` | Default engineering profile for most app codebases. |
| `security` | Security-heavy setup with baseline runtime support and security guidance. |
| `research` | Research and content-oriented setup for investigation, synthesis, and publishing workflows. |
| `full` | Complete install with all classified modules. |

## Components

Use these with `--with` and `--without`.

| Component | Purpose |
|---|---|
| `baseline:rules` | Core shared rules and supported language rule packs. |
| `baseline:agents` | Baseline agent definitions and shared `AGENTS.md` guidance. |
| `baseline:commands` | Core command library and workflow command docs. |
| `baseline:hooks` | Hook runtime configs and helper scripts. |
| `baseline:platform` | Platform configs, package-manager setup, and MCP defaults. |
| `baseline:workflow` | Evaluation, TDD, verification, and compaction workflow support. |
| `lang:typescript` | TypeScript and JavaScript application guidance. |
| `lang:python` | Python and Django-oriented guidance. |
| `lang:go` | Go coding and testing guidance. |
| `lang:java` | Java and Spring application guidance. |
| `lang:swift` | Swift, SwiftUI, and Apple platform guidance. |
| `lang:cpp` | C++ coding standards and testing guidance. |
| `lang:c` | C guidance through the shared C/C++ standards stack. |
| `lang:kotlin` | Kotlin, Ktor, Exposed, Coroutines, and Compose guidance. |
| `lang:arkts` | HarmonyOS, ArkTS, and ArkUI guidance. |
| `lang:perl` | Modern Perl patterns, testing, and security guidance. |
| `lang:ruby` | Ruby and Rails coding, testing, and security guidance. |
| `lang:rust` | Rust patterns and testing guidance. |
| `lang:csharp` | C# coding standards and patterns guidance. |
| `lang:fsharp` | F# functional patterns and testing guidance. |
| `framework:angular` | Angular-focused engineering rules and guidance. |
| `framework:react` | React-focused engineering guidance. |
| `framework:vue` | Vue, Nuxt, Pinia, and Vue Router guidance. |
| `framework:nextjs` | Next.js-focused engineering guidance. |
| `framework:django` | Django-focused engineering guidance. |
| `framework:springboot` | Spring Boot-focused engineering guidance. |
| `framework:quarkus` | Quarkus REST, Panache, security, testing, and verification guidance. |
| `framework:rails` | Rails application guidance. |
| `framework:laravel` | Laravel patterns, TDD, verification, and security guidance. |
| `capability:database` | Database and persistence-oriented skills. |
| `capability:security` | Security review and secure framework guidance. |
| `capability:research` | Research and API-integration skills. |
| `capability:content` | Business writing, market, investor, and voice-system skills. |
| `capability:operators` | Connected-app operator workflows. |
| `capability:optimization` | Parallel execution, benchmarking, throughput, and latency skills. |
| `capability:prediction-markets` | Public, non-advisory prediction-market research workflows. |
| `capability:social` | Social publishing and distribution skills. |
| `capability:media` | Media generation, explainers, and AI-assisted editing skills. |
| `capability:orchestration` | Worktree and tmux orchestration workflows. |
| `capability:agentic` | Agentic engineering, loops, and LLM pipeline optimization. |
| `capability:devops` | Deployment, Docker, and infrastructure patterns. |

Single-skill install components are also generated automatically:

```bash
./install.sh --target codex --skills api-design,tdd-workflow,security-review
```

## Rule Packs

Every language/framework rule pack follows the same shape: coding style,
patterns, security, testing, and hook guidance. Extra web/native packs include
accessibility, performance, design quality, or production-readiness files where
relevant.

| Rule pack | Files |
|---|---|
| `common` | agents, code-review, coding-style, development-workflow, git-workflow, hooks, patterns, performance, security, testing |
| `angular` | coding-style, hooks, patterns, security, testing |
| `arkts` | coding-style, hooks, patterns, security, testing |
| `cpp` | coding-style, hooks, patterns, security, testing |
| `csharp` | coding-style, hooks, patterns, security, testing |
| `dart` | coding-style, hooks, patterns, security, testing |
| `fsharp` | coding-style, hooks, patterns, security, testing |
| `golang` | coding-style, hooks, patterns, security, testing |
| `java` | coding-style, hooks, patterns, security, testing |
| `kotlin` | coding-style, hooks, patterns, security, testing |
| `nuxt` | coding-style, hooks, patterns, security, testing |
| `perl` | coding-style, hooks, patterns, security, testing |
| `php` | coding-style, hooks, patterns, security, testing |
| `python` | coding-style, fastapi, hooks, patterns, security, testing |
| `react` | coding-style, hooks, patterns, security, testing |
| `react-native` | accessibility, coding-style, hooks, patterns, performance, production-readiness, security, testing |
| `ruby` | coding-style, hooks, patterns, security, testing |
| `rust` | coding-style, hooks, patterns, security, testing |
| `swift` | coding-style, hooks, patterns, security, testing |
| `typescript` | coding-style, hooks, patterns, security, testing |
| `vue` | coding-style, hooks, patterns, security, testing |
| `web` | coding-style, design-quality, hooks, patterns, performance, security, testing |

## Commands

| Command | Purpose |
|---|---|
| `/aside` | Answer a quick side question without interrupting the current task. |
| `/auto-update` | Pull latest repo changes and reinstall current managed targets. |
| `/build-fix` | Detect the build system and incrementally fix build/type errors. |
| `/checkpoint` | Create, verify, or list workflow checkpoints after verification checks. |
| `/code-review` | Review local uncommitted changes or a GitHub PR. |
| `/cost-report` | Generate a local cost report from SCS cost-tracker metrics. |
| `/cpp-build` | Fix C++ build, CMake, linker, and template errors. |
| `/cpp-review` | Review C++ for memory safety, idioms, concurrency, and security. |
| `/cpp-test` | Run C++ TDD workflow with GoogleTest and coverage. |
| `/scs-guide` | Navigate current agents, skills, commands, hooks, profiles, and docs. |
| `/epic-claim` | Claim an epic issue and sync local ownership state. |
| `/epic-decompose` | Break an epic into child tasks. |
| `/epic-publish` | Publish a validated epic update. |
| `/epic-review` | Mark epic review requested, approved, or changes requested. |
| `/epic-sync` | Sync epic issue bodies, labels, and local snapshots. |
| `/epic-unblock` | Reopen blocked epic issues whose dependencies are closed. |
| `/epic-validate` | Validate epic readiness, dependencies, and coordination policy. |
| `/evolve` | Analyze instincts and suggest or generate evolved structures. |
| `/fastapi-review` | Review FastAPI architecture, async use, schemas, security, and tests. |
| `/feature-dev` | Guided feature development with codebase and architecture context. |
| `/flutter-build` | Fix Dart analyzer and Flutter build failures. |
| `/flutter-review` | Review Flutter/Dart code, widgets, state, performance, and a11y. |
| `/flutter-test` | Run and fix Flutter/Dart unit, widget, golden, and integration tests. |
| `/gan-build` | Run a bounded generator/evaluator implementation loop. |
| `/gan-design` | Run a bounded generator/evaluator loop for visual work. |
| `/go-build` | Fix Go build, vet, and linter failures. |
| `/go-review` | Review Go for idioms, concurrency, errors, and security. |
| `/go-test` | Run Go TDD with table-driven tests and coverage. |
| `/gradle-build` | Fix Gradle build errors for Android and KMP projects. |
| `/harness-audit` | Audit repository harness reliability and return a scorecard. |
| `/hookify` | Create hooks from conversation analysis or explicit instructions. |
| `/hookify-configure` | Enable or disable hookify rules interactively. |
| `/hookify-help` | Show help for hookify. |
| `/hookify-list` | List configured hookify rules. |
| `/instinct-export` | Export instincts from project or global scope. |
| `/instinct-import` | Import instincts from a file or URL. |
| `/instinct-status` | Show learned instincts and confidence. |
| `/jira` | Retrieve, analyze, update, or comment on Jira tickets. |
| `/kotlin-build` | Fix Kotlin and Gradle build/dependency errors. |
| `/kotlin-review` | Review Kotlin for idioms, null safety, coroutines, and security. |
| `/kotlin-test` | Run Kotlin TDD with Kotest and Kover coverage. |
| `/learn` | Extract reusable session patterns as skills or guidance. |
| `/learn-eval` | Self-evaluate extracted patterns before saving them. |
| `/loop-start` | Start a managed autonomous loop with stop conditions. |
| `/loop-status` | Inspect active loop state, progress, and failure signals. |
| `/marketing-campaign` | Create positioning, copy, ad variants, scripts, and calendars. |
| `/model-route` | Recommend a model tier based on complexity, risk, and budget. |
| `/multi-backend` | Run a backend-focused multi-model workflow. |
| `/multi-execute` | Execute a multi-model plan while keeping one filesystem writer. |
| `/multi-frontend` | Run a frontend-focused multi-model workflow. |
| `/multi-plan` | Create a multi-model plan without modifying production code. |
| `/multi-workflow` | Run a full multi-model development workflow. |
| `/orch-add-feature` | Orchestrate a new feature end to end. |
| `/orch-build-mvp` | Bootstrap a working MVP from a design or spec. |
| `/orch-change-feature` | Change existing feature behavior with updated tests. |
| `/orch-fix-defect` | Reproduce a bug with a failing test, then fix it. |
| `/orch-refine-code` | Run a behavior-preserving refactor workflow. |
| `/orch-review` | Review a local diff or PR with orchestration workflow rules. |
| `/plan` | Restate requirements, assess risks, and create an implementation plan. |
| `/plan-prd` | Generate a lean PRD and hand off to planning. |
| `/pm2` | Generate PM2 service commands for detected services. |
| `/pr` | Create a GitHub PR from the current branch. |
| `/project-init` | Detect stack and produce a dry-run SCS onboarding plan. |
| `/projects` | List known projects and instinct statistics. |
| `/promote` | Promote project-scoped instincts to global scope. |
| `/prp-commit` | Commit selected changes from natural language targeting. |
| `/prp-implement` | Execute an implementation plan with validation loops. |
| `/prp-plan` | Create a comprehensive implementation plan. |
| `/prp-pr` | Create a GitHub PR from the current branch. |
| `/prp-prd` | Generate an interactive product spec. |
| `/prune` | Delete stale pending instincts. |
| `/python-review` | Review Python for PEP 8, typing, security, and idioms. |
| `/quality-gate` | Run the formatter quality gate for a file. |
| `/react-build` | Fix React/Vite/Next/Webpack build failures. |
| `/react-review` | Review React/JSX for hooks, performance, boundaries, a11y, and security. |
| `/react-test` | Run React TDD with Testing Library and coverage. |
| `/refactor-clean` | Identify and remove dead code safely. |
| `/resume-session` | Load the most recent saved session context. |
| `/review-pr` | Run comprehensive PR review with specialized agents. |
| `/rust-build` | Fix Rust build, borrow checker, and dependency errors. |
| `/rust-review` | Review Rust ownership, lifetimes, errors, unsafe code, and idioms. |
| `/rust-test` | Run Rust TDD with coverage. |
| `/santa-loop` | Run adversarial dual-review convergence before shipping. |
| `/save-session` | Save current session state for future resumption. |
| `/security-scan` | Scan agent, hook, MCP, permission, and secret surfaces. |
| `/sessions` | Manage session history, aliases, and metadata. |
| `/setup-pm` | Configure npm, pnpm, yarn, or bun preferences. |
| `/skill-create` | Extract coding patterns from git history into skills. |
| `/skill-health` | Show skill portfolio health. |
| `/test-coverage` | Analyze coverage and generate missing tests. |
| `/update-codemaps` | Generate token-lean architecture codemaps. |
| `/update-docs` | Sync docs from source-of-truth files. |
| `/vue-review` | Review Vue/Nuxt code for reactivity, components, security, a11y, and performance. |

## Developer Commands

```bash
npm test
npm run catalog:check
npm run command-registry:check
npm run lint
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --list-components --family capability
node scripts/install-plan.js --profile developer --target codex
```

## Repository Layout

```text
agents/          Specialized agent definitions
skills/          Canonical workflow and domain skills
commands/        Slash-command compatibility surface
rules/           Shared and language-specific rule packs
hooks/           Hook configs and hook docs
scripts/         Installer, validation, orchestration, and utility scripts
manifests/       Install profiles, components, and modules
schemas/         JSON schemas for install and plugin metadata
mcp-configs/     MCP server configuration defaults
plugins/         Plugin packaging surfaces
```
