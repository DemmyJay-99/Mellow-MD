<div align="center">

<img src="https://i.ibb.co/fVJQHczm/siGOdOA.jpg" width="180" style="border-radius: 50%; margin: 20px 0;" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=7B2FF7&center=true&vCenter=true&width=500&lines=Fast+%26+Lightweight+WhatsApp+Bot;Multi-Device+Support;Plugin-Based+Architecture;Easy+to+Deploy+Anywhere" alt="Typing SVG" />

<br/>

[![Fork](https://img.shields.io/badge/Fork%20Repo-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DemmyJay-99/Mellow-MD/fork)
[![Star](https://img.shields.io/badge/Star%20⭐%20Repo-f7c948?style=for-the-badge&logo=github&logoColor=black)](https://github.com/DemmyJay-99/Mellow-MD)
[![Pair Now](https://img.shields.io/badge/Get%20Session%20ID-7b2ff7?style=for-the-badge&logo=whatsapp&logoColor=white)](https://pairing-site-rho.vercel.app/)

</div>


## Getting Your Session ID

Visit **[![Pairing Site](https://img.shields.io/badge/Pairing%20Site-7b2ff7?style=for-the-badge&logo=whatsapp&logoColor=white)](https://pairing-site-rho.vercel.app/)** to get session ID
---

## Configuration

Create a `.env` file in the project root based on `sample.env` and fill in the variables below:

```env
SESSION_ID=
PLATFORM=
AUTO_UPDATE=
OWNER_NUMBER=
REACT_EMOJI=
GENIUS_API_KEY=
ALWAYS_ONLINE=
STICKER_PACKNAME=
WARN_LIMIT =
```

| Variable | Description |
|---|---|
| `SESSION_ID` | Session ID received after pairing at the pairing site |
| `PLATFORM` | Label shown in the bot menu (e.g. `Replit`, `VPS`, `Panel`) |
| `AUTO_UPDATE` | Set to `true` to enable automatic bot updates |
| `OWNER_NUMBER` | Your WhatsApp number with country code, no `+` (e.g. `234123456789`) |
| `REACT_EMOJI` | Emoji the bot reacts with when a command is used (e.g. `✨`) |
| `GENIUS_API_KEY` | API key from [genius.com](https://genius.com/api-clients) for lyrics features |
| `ALWAYS_ONLINE` | Set to `true` to keep the bot's WhatsApp status always online |
| `STICKER_PACKNAME` | Pack name and author for stickers, separated by a comma — e.g. `packname,author` |
|`WARN_LIMIT =`| Number of warnings before a group member gets removed|

---

## Deployment

<div align="center">

### Deploy Now

[![Deploy on KataBump](https://img.shields.io/badge/KataBump-0e76a8?style=for-the-badge&logo=serverless&logoColor=white)](https://dashboard.katabump.com/auth/login#c0b714)
[![Deploy on Bot-Hosting Panel](https://img.shields.io/badge/Bot--Hosting.net-7b2ff7?style=for-the-badge&logo=serverless&logoColor=white)](https://bot-hosting.net/?aff=1280297606333071372)
[![Deploy on Render](https://img.shields.io/badge/Deploy%20on%20Render-46e3b7?style=for-the-badge&logo=render&logoColor=black)](https://dashboard.render.com)
[![Deploy on Replit](https://img.shields.io/badge/Deploy%20on%20Replit-f26207?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/github/DemmyJay-99/Mellow-MD)

</div>

---

### Option 1 — Pterodactyl Panel

1. Visit **[Pairing Site](https://pairing-site-rho.vercel.app/)** and pair your WhatsApp number.
2. Go to the **Deploy** section on the pairing site.
3. Enter your **Session ID** in the provided field.
4. Click **Download** to get your custom `index.js` file.
5. Upload the downloaded `index.js` to your Pterodactyl panel and start the server.
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

1. Create a repository and upload the official **Dockerfile**.
2. Go to the Render Dashboard and create a new **Web Service**.
3. Connect your repository and use the **Docker** runtime.
4. Configure the mandatory environment variables (`SESSION_ID`, `PORT`).

---

<div align="center">
Developed by **[Mellow](https://github.com/DemmyJay-99)**
</div>
