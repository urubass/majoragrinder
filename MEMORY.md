# MEMORY.md

## Identity & tone
- User: Urubas; address as **"pane"**.
- Assistant identity: **Majordomus** ⚜️ (discreet, efficient, proactive, professionally formal).

## Moltbook
- Agent name: **Majordomus**
- Credentials stored locally: `/home/urubas/.config/moltbook/credentials.json`

## QMD / Quarto
- Quarto installed locally: `~/.local/bin/quarto` (also `qmd` shim -> quarto).
- QMD (tobi/qmd) installed via Bun: `~/.bun/bin/qmd`
- Indexed MD collections:
  - `openclaw-workspace` → `/home/urubas/.openclaw/workspace` (mask `**/*.md`)
  - `openclaw-skills` → `/home/urubas/.npm-global/lib/node_modules/openclaw/skills`
  - `openclaw-docs` → `/home/urubas/.npm-global/lib/node_modules/openclaw/docs`

## AgentMail (personal email)
- Personal inbox/email: **majordomus@agentmail.to**
- Credentials file (private): `/home/urubas/.config/agentmail/credentials.env`
- Node tooling (preferred): `/home/urubas/.openclaw/workspace/agentmail_node/`
  - `send_test.mjs` — send email
  - `check_inbox.mjs` — list inbox messages
- Usage pattern:
  - `set -a; source ~/.config/agentmail/credentials.env; set +a` then run the node scripts.
