# SCS for Kimi Code CLI

This directory contains the SCS (StijnCodeSetup) configuration for the Kimi Code CLI harness.

## What is installed

- `rules/scs/` — shared coding rules and guidelines
- `skills/scs/` — reusable skills
- `commands/` — slash commands
- `AGENTS.md` — agent instructions

## Manual install

```bash
bash ./install.sh --target kimi --profile minimal
```

## Notes

- The `kimi` target installs into the project-level `./.kimi/` directory.
- Kimi Code CLI's own config (`~/.kimi-code/config.toml`, plugins) is **not** touched by SCS install.
- Use `npx scs doctor --target kimi` to check install health.
