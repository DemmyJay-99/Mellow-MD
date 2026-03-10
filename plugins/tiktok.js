import { ttdl } from "ruhend-scraper"

export default {
    name: "tiktok",
    description: "Download Tiktok videos",
    isPublic: false,
    category: "Downloaders",
    execute: async (sock, msg, args) => {
        if(!args || args.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "Usage: tiktok <TikTok URL> (or reply to a message with the URL)"
            })
            return
        }
        const url = args[0];
        function isTikTokUrlRegex(url) {
          const tiktokRegex = new RegExp(/^(https?:\/\/)?(www\.|m\.|vm\.)?tiktok\.com\b/);
          return tiktokRegex.test(url);
        }
        if(!isTikTokUrlRegex(url)) {
           await sock.sendMessage(msg.key.remoteJid, {text: "Invalid url"})
        }
        let { video } = await ttdl(url);
        await sock.sendMessage(msg.key.remoteJid,
            {video: {url: video}}
        )
    }
}