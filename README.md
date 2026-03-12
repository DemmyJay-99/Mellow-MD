# Mellow MD

A WhatsApp bot built with the Baileys multi-device library. Once authenticated, the bot runs independently without requiring the paired phone to stay online.

---

## Prerequisites

- Node.js v18 or higher
- npm
- A WhatsApp account to pair with the bot
- A GitHub Gist containing your `creds.json` session file (see Session Setup below)

---

## Session Setup

Mellow MD authenticates via a `creds.json` file hosted on a **GitHub Gist**.

1. Run the bot locally once to generate `creds.json` (it will appear in the `auth/` folder after pairing).
2. Create a **secret GitHub Gist** and upload the contents of `creds.json`.
3. Copy the **Gist ID** from the URL (the long alphanumeric string after `gist.github.com/<username>/`).
4. Set this as your `SESSION_ID` environment variable (see Configuration below).

---

## Configuration

### Environment Variables

Create a `.env` file in the project root based on `sample.env`:

```
SESSION_ID=<your_gist_id>
PLATFORM=<e.g. Replit, VPS, Docker>
```

| Variable | Description |
|---|---|
| `SESSION_ID` | GitHub Gist ID containing your `creds.json` |
| `PLATFORM` | Label shown in the bot menu (e.g. `Replit`) |

### Bot Settings (`config.js`)

Edit `config.js` to customise the bot behaviour:

| Setting | Default | Description |
|---|---|---|
| `prefix` | `.` | Command prefix |
| `ownerNumber` | `2348101653826` | Your WhatsApp number (with country code, no `+`) |
| `botName` | `Mellow MD` | Name displayed in the menu |
| `OwnerName` | `Mellow` | Owner name displayed in the menu |
| `reactEmoji` | `✨` | Emoji reacted to each command |
| `allowedUsers` | `[]` | Additional WhatsApp IDs allowed to use owner commands |

---

## Deployment

### Option 1 — Node.js (VPS / Local)

```bash
git clone https://github.com/DemmyJay-99/Mellow-MD.git
cd Mellow-MD
npm install
cp sample.env .env
# Fill in SESSION_ID and PLATFORM in .env
npm start
```

### Option 2 — Replit

1. Fork or import the repository into Replit.
2. Add `SESSION_ID` and `PLATFORM` as **Secrets** in the Replit dashboard.
3. The `Start application` workflow will run `npm start` automatically.

### Option 3 — Docker

```bash
docker build -t mellowmd .
docker run -d \
  -e SESSION_ID=<your_gist_id> \
  -e PLATFORM=Docker \
  -p 5000:5000 \
  mellowmd
```

The Dockerfile clones the repository, installs dependencies, and starts the bot on port `5000`.

---

## Starting the Bot

```bash
npm start
```

The bot will fetch `creds.json` from your Gist using `SESSION_ID` and connect to WhatsApp automatically. No QR scan is needed after the first pairing.
