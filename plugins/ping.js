export default {
    name: "ping",
    description: "Replies with pong!",
    isPublic: false,
    execute: async (sock, msg, args) => {
        const start = Date.now();
        await sock.sendMessage(msg.key.remoteJid, { text: "Pong!" });
        const latency = Date.now() - start;
        await sock.sendMessage(msg.key.remoteJid, {text: `${latency}ms`})
    }
};
