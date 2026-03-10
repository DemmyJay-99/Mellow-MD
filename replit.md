# Mellow MD - WhatsApp Bot

A multi-device WhatsApp bot built with Node.js and the Baileys library (@whiskeysockets/baileys).

## Project Overview

This is a WhatsApp automation bot that connects via the Baileys multi-device protocol. It supports a plugin-based command system and requires a WhatsApp session ID to authenticate.

## Project Structure

```
index.js          - Main entry point; initializes the WhatsApp socket connection
config.js         - Bot configuration (prefix, owner number, bot name, etc.)
lib/
  session.js      - Handles session validation and credential fetching from GitHub Gist
  commandHandler.js - Loads plugins and routes incoming messages to commands
plugins/          - Individual command modules (ping, menu, tiktok, uptime, etc.)
.env              - Environment variables (SESSION_ID, PLATFORM)
sample.env        - Template for environment variables
```

## Environment Variables

- `SESSION_ID` - GitHub Gist ID containing the WhatsApp `creds.json` session file (required)
- `PLATFORM` - Platform identifier (optional)

## Setup

1. Set `SESSION_ID` in `.env` to a valid GitHub Gist ID containing `creds.json`
2. Run `node index.js`

## Workflow

- **Start application**: `node index.js` (console output)

## Deployment

- Target: VM (always running)
- Command: `node index.js`

## Key Dependencies

- `@whiskeysockets/baileys` - WhatsApp Web API multi-device
- `dotenv` - Environment variable loading
- `axios` - HTTP requests (for session fetching)
- `pino` - Logging
- `express` - Included as dependency (not currently used for a web server)
- `qrcode-terminal` - QR code display in terminal
