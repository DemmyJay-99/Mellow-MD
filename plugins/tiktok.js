import { ttdl } from "ruhend-scraper"

export default {
    name: "tiktok",
    description: "Download Tiktok videos",
    isPublic: false,
    execute: async (sock, msg, args) => {
        if(!args || args.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "invalid url"
            })
            return
        }
        let { video } = await ttdl(args[0]);
        await sock.sendMessage(msg.key.remoteJid,
            {video: {url: video}}
        )
    }
}