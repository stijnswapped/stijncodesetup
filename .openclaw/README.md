# SCS for OpenClaw

This directory contains the SCS (StijnCodeSetup) configuration for the OpenClaw harness.

## What is installed

- `rules/scs/` — shared coding rules and guidelines
- `skills/scs/` — reusable skills
- `commands/` — slash commands
- `AGENTS.md` — agent instructions

## Manual install

```bash
bash ./install.sh --target openclaw --profile minimal
```

## Notes

- OpenClaw config files (`openclaw.json`, `config.toml`, `.env`, etc.) are **not** touched by SCS install.
- Use `npx scs doctor --target openclaw` to check install health.
