<div align="center">

# MELLOW MD
</div>

<div align="center">

<img src="https://i.ibb.co/fVJQHczm/siGOdOA.jpg" width="280" style="border-radius: 2%; margin: 20px 0;" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=7B2FF7&center=true&vCenter=true&width=500&lines=Fast+%26+Lightweight+WhatsApp+Bot;Multi-Device+Support;Plugin-Based+Architecture;Easy+to+Deploy+Anywhere" alt="Typing SVG" />

[![Fork](https://img.shields.io/badge/Fork%20Repo-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DemmyJay-99/Mellow-MD/fork)
[![Star](https://img.shields.io/badge/Star%20⭐%20Repo-f7c948?style=for-the-badge&logo=github&logoColor=black)](https://github.com/DemmyJay-99/Mellow-MD)
[![Pair Now](https://img.shields.io/badge/Get%20Session%20ID-7b2ff7?style=for-the-badge&logo=whatsapp&logoColor=white)](https://mellow-md.zone.id/)

</div>

## Table of Contents
- [Requirements](#requirements)
- [Getting Your Session ID](#getting-your-session-id)
- [Features](#features)
- [Configuration](#configuration)
- [Deployment](#deployment)
  - [Deploy on Panel](#deploy-on-panel)
  - [Deploy on VPS or Local Machine](#deploy-on-vps-or-local-machine)
  - [Deploy on Replit](#deploy-on-replit)
  - [Deploy on Render](#deploy-on-render)
- [Disclaimer](#disclaimer)
- [License](#license)
- [Support](#support)

## Requirements

- Node.js 22+
- Yarn
- Git
- FFmpeg (for media processing features)


> [!WARNING]
> Use a dedicated WhatsApp account for the bot. Using your personal number may increase the risk of account restrictions or bans.


## Getting Your Session ID
Visit **[![Pairing Site](https://img.shields.io/badge/Pairing%20Site-7b2ff7?style=for-the-badge&logo=whatsapp&logoColor=white)](https://mellow-md.zone.id/)** to get session ID
---


## Features
- Fast and lightweight WhatsApp bot built with Baileys
- Multi-device support without keeping your phone online
- Plugin-based architecture for easy command management
- Auto-update feature to keep your bot up-to-date with the latest features and fixes
- Media downloaders (YouTube, Instagram, TikTok, Facebook,Twitter etc.)
- Music and lyrics search with Genius API integration
- File conversion (e.g. media to sticker)
- Group management tools (e.g. warn system, anti-link)
- Role System (Owner, Admin, Sudo)


## Configuration

Create a `config.env` file in the project root based on `.env.example` and fill in the variables below:

```env
SESSION_ID=
PLATFORM=
AUTO_UPDATE_BOT=
REACT_EMOJI=
GENIUS_API_KEY=
ALWAYS_ONLINE=
STICKER_PACKNAME=
WARN_LIMIT=
YT_COOKIE=
```

| Variable | Description |
|---|---|
| `SESSION_ID` | Session ID received after pairing at the pairing site |
| `PLATFORM` | Label shown in the bot menu (e.g. `Replit`, `VPS`, `Panel`) |
| `AUTO_UPDATE_BOT` | Set to `true` to enable automatic bot updates |
| `REACT_EMOJI` | Emoji the bot reacts with when a command is used (e.g. `✨`) |
| `GENIUS_API_KEY` | API key from [genius.com](https://genius.com/api-clients) for lyrics features |
| `ALWAYS_ONLINE` | Set to `true` to keep the bot's WhatsApp status always online |
| `STICKER_PACKNAME` | Pack name and author for stickers, separated by a comma — e.g. `packname,author` |
| `WARN_LIMIT` | Number of warnings before a group member gets removed |
| `YT_COOKIE` | Youtube cookie in Netscape format |

---

## Deployment

### Deploy on Panel
<div align="center">

[![Panel Tutorial](https://img.shields.io/badge/Panel%20Tutorial-f00000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/gm0VcsKGAE4?si=PryYKGYqeaOp3FNT)
[![Deploy on Optiklink](https://img.shields.io/badge/Optiklink-0e76a8?style=for-the-badge)](https://optiklink.net/)
[![Deploy on Bot-Hosting Panel](https://img.shields.io/badge/Bot--Hosting.net-7b2ff7?style=for-the-badge&logo=serverless&logoColor=white)](https://bot-hosting.net/?aff=1280297606333071372)
</div>

1. Visit **[Pairing Site](https://mellow-md.zone.id/)** and pair your WhatsApp number.
2. Go to the **Deploy** section on the pairing site.
3. Enter your **Session ID** in the provided field.
4. Click **Download** to get your custom `index.js` file.
5. Upload the downloaded `index.js` to your Pterodactyl panel and start the server.


---
### Deploy on Render

[![Deploy on Render](https://img.shields.io/badge/Deploy-46e3b7?style=for-the-badge&logo=render&logoColor=black)](https://dashboard.render.com)


1. Create a repository and upload the official **Dockerfile**.
2. Go to the Render Dashboard and create a new **Web Service**.
3. Connect your repository and use the **Docker** runtime.
4. Configure the mandatory environment variables (`SESSION_ID`, `PORT`).
5. Deploy the service and monitor logs for successful startup.
---

### Deploy on VPS or Local Machine

```bash
git clone https://github.com/DemmyJay-99/Mellow-MD.git
cd Mellow-MD
npm install -g yarn
yarn install
cp .env.example config.env
# Fill in SESSION_ID and PLATFORM in config.env
npm start
```

---

### Deploy on Replit

[![Replit](https://img.shields.io/badge/Replit-f26207?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/github/DemmyJay-99/Mellow-MD)

1. Click **[Deploy on Replit](https://replit.com/github/DemmyJay-99/Mellow-MD)** above, or fork the repo and import it manually.
2. Add `SESSION_ID` and `PLATFORM` as **Secrets** in the Replit dashboard.
3. The application will start automatically using the configured workflow.


## Disclaimer

> [!CAUTION]
> This project is **not affiliated with WhatsApp Inc.** Use responsibly and within [WhatsApp's Terms of Service](https://www.whatsapp.com/legal/terms-of-service). The developers are not responsible for account bans or misuse.

---


## License

[MIT License](LICENSE) · Made with ❤️ by [Mellow](https://github.com/DemmyJay-99)


## Support
<div align="center">

[![GitHub Repo](https://img.shields.io/badge/GitHub%20Repo-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DemmyJay-99/Mellow-MD)
[![YouTube Channel](https://img.shields.io/badge/YouTube%20Channel-f00000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@mellow-w3s)
[![Telegram Channel](https://img.shields.io/badge/Join%20Telegram%20Group-25D366?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/mellowmd)
</div>
