export default {
    name: "restart",
    description: "Restart the bot",
    isPublic: false,
    category: "Bot",
    execute: async (sock, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        await sock.sendMessage(remoteJid, { text: "Restarting..." });
        process.exit(0);
    }
}