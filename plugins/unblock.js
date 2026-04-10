export default {
    name: "unblock",
    description: "unblock a user on WhatsApp",
    isPublic: false,
    category: "Owner",
    Usage: "Reply to a user, mention them, or use `.unblock <number>`.",
    execute: async (sock, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        let targetJid;
        if (ctxInfo?.participant) {
            targetJid = ctxInfo.participant;
        } else if (ctxInfo?.mentionedJid?.length) {
            targetJid = ctxInfo.mentionedJid[0];
        } else if (args[0]) {
            const num = args[0].replace(/\D/g, "");
            if (!num) {
                await sock.sendMessage(remoteJid, {
                    text: "Provide a valid number.",
                });
                return;
            }
            targetJid = num + "@s.whatsapp.net";
        } else {
            await sock.sendMessage(remoteJid, {
                text: "Reply to a user or mention one, or use `.unblock <number>`.",
            });
            return;
        }

        try {
            await sock.updateBlockStatus(targetJid, "unblock");
            await sock.sendMessage(remoteJid, {
                text: `Unblocked`,
            });
        } catch (err) {
            console.error("block error:", err);
            await sock.sendMessage(remoteJid, {
                text: "Failed to unblock user.",
            });
        }
    },
};
