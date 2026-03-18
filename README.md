<h1 align='center'> Mellow MD (Multi-Device Whatsapp Bot)</h1>

A WhatsApp bot built with the Baileys multi-device library. Once authenticated, the bot runs independently without requiring the paired phone to stay online.

---

## Prerequisites

- Node.js v18 or higher
- npm
- A WhatsApp account to pair with the bot
- A `SESSION_ID` obtained by pairing at [https://pairing-site-rho.vercel.app/](https://pairing-site-rho.vercel.app/)

---

## Getting Your Session ID

1. Visit  [https://pairing-site-rho.vercel.app/](https://pairing-site-rho.vercel.app/) and follow the pairing steps.
2. After pairing, your `SESSION_ID` will be sent to you via WhatsApp DM.
3. Copy it and set it as your `SESSION_ID` environment variable (see Configuration below).

---

## Configuration

### Environment Variables

Create a `.env` file in the project root based on `sample.env`:

```
SESSION_ID=<your_session_id>
PLATFORM=<e.g. Replit, VPS, Docker>
```

| Variable | Description |
|---|---|
| `SESSION_ID` | Session ID received after pairing at the site |
| `PLATFORM` | Label shown in the bot menu (e.g. `Replit`) |

### Bot Settings (`config.js`)

Edit `config.js` to customise the bot behaviour:

| Setting | Default | Description |
|---|---|---|
| `prefix` | `.` | Command prefix |
| `ownerNumber` | `2348xxxxxxxxx` | Your WhatsApp number (with country code, no `+`) |

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
  -e SESSION_ID=<your_session_id> \
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

The bot will use your `SESSION_ID` to authenticate and connect to WhatsApp automatically. No QR scan is needed after pairing.
