import { igdl } from "ruhend-scraper"

export default {
    name: "insta",
    description: "Download IG reels",
    isPublic: false,
    category: "Downloaders",
    execute: async (sock, msg, args) => {
        if(!args || args.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "invalid url"
            })
            return
        }
        const url = args[0];
        
        function checkInstagram(url) {
            const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)/i;
            return igRegex.test(url);
        }
        if(!checkInstagram(url)){
            await sock.sendMessage(msg.key.remoteJid, {text: "Invalid url"})
        }
        const res = await igdl(url)        
        const data = res.data[0].url;
        await sock.sendMessage(msg.key.remoteJid,
            {video: {url: data}}
        )
    }
}