import { igdl } from "ruhend-scraper"

export default {
    name: "insta",
    description: "Download IG reels",
    isPublic: false,
    execute: async (sock, msg, args) => {
        if(!args || args.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "invalid url"
            })
            return
        }
        const res = await igdl(args[0])        
        const data = res.data[0].url;
        await sock.sendMessage(msg.key.remoteJid,
            {video: {url: data}}
        )
    }
}