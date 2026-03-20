<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7b2ff7,100:f107a3&height=180&section=header&text=Mellow%20MD&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Multi-Device%20WhatsApp%20Bot&descAlignY=58&descSize=20&descColor=ffffff" width="100%"/>

<img src="https://i.ibb.co/fVJQHczm/siGOdOA.jpg" width="180" style="border-radius: 50%; margin: 20px 0;" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=7B2FF7&center=true&vCenter=true&width=500&lines=Fast+%26+Lightweight+WhatsApp+Bot;Multi-Device+Support;Plugin-Based+Architecture;Easy+to+Deploy+Anywhere" alt="Typing SVG" />

<br/>

[![Fork](https://img.shields.io/badge/Fork%20Repo-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DemmyJay-99/Mellow-MD/fork)
[![Star](https://img.shields.io/badge/Star%20⭐%20Repo-f7c948?style=for-the-badge&logo=github&logoColor=black)](https://github.com/DemmyJay-99/Mellow-MD)
[![Pair Now](https://img.shields.io/badge/Get%20Session%20ID-7b2ff7?style=for-the-badge&logo=whatsapp&logoColor=white)](https://pairing-site-rho.vercel.app/)

</div>

---

## Prerequisites

- Node.js v18 or higher
- npm
- A WhatsApp account to pair with the bot
- A `SESSION_ID` — get yours at **[pairing-site-rho.vercel.app](https://pairing-site-rho.vercel.app/)**

---

## Getting Your Session ID

1. Visit **[https://pairing-site-rho.vercel.app/](https://pairing-site-rho.vercel.app/)** and follow the pairing steps.
2. After pairing, your `SESSION_ID` will be sent to you via WhatsApp DM.
3. Copy it — you will need it for every deployment option below.

---

## Configuration

### Environment Variables

Create a `.env` file in the project root based on `sample.env`:

```env
SESSION_ID=<your_session_id>
PLATFORM=<e.g. Replit, VPS, Panel>
```

| Variable | Description |
|---|---|
| `SESSION_ID` | Session ID received after pairing |
| `PLATFORM` | Label shown in the bot menu |

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

<div align="center">

### Deploy Now

[![Deploy on KataBump Panel](https://img.shields.io/badge/Deploy%20on%20KataBump-0e76a8?style=for-the-badge&logo=serverless&logoColor=white)](https://dashboard.katabump.com/auth/login#c0b714)
[![Deploy on Bot-Hosting Panel](https://img.shields.io/badge/Deploy%20on%20Bot--Hosting-7b2ff7?style=for-the-badge&logo=serverless&logoColor=white)](https://bot-hosting.net/?aff=1280297606333071372)
[![Deploy on Render](https://img.shields.io/badge/Deploy%20on%20Render-46e3b7?style=for-the-badge&logo=render&logoColor=black)](https://dashboard.render.com)
[![Deploy on Replit](https://img.shields.io/badge/Deploy%20on%20Replit-f26207?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/github/DemmyJay-99/Mellow-MD)

</div>

---

### Option 1 — Pterodactyl Panel

> Supports any Pterodactyl-based hosting panel including KataBump and Bot-Hosting.

1. Visit **[https://pairing-site-rho.vercel.app/](https://pairing-site-rho.vercel.app/)** and pair your WhatsApp number.
2. Go to the **Deploy** section on the pairing site.
3. Enter your **Session ID** in the provided field.
4. Click **Download** to get your custom `index.js` file.
5. Upload the downloaded `index.js` to your Pterodactyl panel and start the server.

No extra setup or `.env` file is needed — the session is embedded directly in the file.

---

### Option 2 — Node.js (VPS / Local)

```bash
git clone https://github.com/DemmyJay-99/Mellow-MD.git
cd Mellow-MD
npm install
cp sample.env .env
# Fill in SESSION_ID and PLATFORM in .env
npm start
```

---

### Option 3 — Replit

1. Click **[Deploy on Replit](https://replit.com/github/DemmyJay-99/Mellow-MD)** above, or fork the repo and import it manually.
2. Add `SESSION_ID` and `PLATFORM` as **Secrets** in the Replit dashboard.
3. The `Start application` workflow will run `npm start` automatically.

---

### Option 4 — Render

1. Click **[Deploy on Render](https://dashboard.render.com)** above and create a new **Web Service**.
2. Connect your forked GitHub repository.
3. Set `SESSION_ID` and `PLATFORM` as environment variables in the Render dashboard.
4. Set the start command to `npm start` and deploy.

---

### Option 5 — Docker

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

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7b2ff7,100:f107a3&height=100&section=footer" width="100%"/>

</div>
