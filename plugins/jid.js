import normaliseLid from "../lib/normaliseLid.js"

export default {
    name: "jid",
    description: "Get the JID of a user",
    isPublic: false,
    category: "Dev",
    execute: async (sock, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        if (remoteJid.endsWith("@lid")) {
            const pn = await normaliseLid(sock, remoteJid);
            await sock.sendMessage(remoteJid, { text: pn});
        } else {
            await sock.sendMessage(remoteJid, { text: remoteJid });
        }
    }
}