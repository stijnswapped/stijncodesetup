# SCS for Hermes

This directory contains the SCS (StijnCodeSetup) configuration for the Hermes harness.

## What is installed

- `rules/scs/` — shared coding rules and guidelines
- `skills/scs/` — reusable skills
- `commands/` — slash commands
- `AGENTS.md` — agent instructions

## Manual install

```bash
bash ./install.sh --target hermes --profile minimal
```

## Notes

- Hermes config files (`config.yaml`, `.env`, etc.) are **not** touched by SCS install.
- Use `npx scs doctor --target hermes` to check install health.
