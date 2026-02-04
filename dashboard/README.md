# Workspace Activity Dashboard

A local-only, read-only dashboard for monitoring OpenClaw workspace activity.

## Setup
1. `cd dashboard`
2. `npm install`
3. `npm start`

## Features
- Monitor gateway status
- See recent file changes in the workspace
- Tail logs and memory files (read-only)

## Security
- Runs only on `127.0.0.1`
- strict allowlist for file access
