export default {
    name: "promote",
    description: "Promote a user to admin",
    isPublic: false,
    category: "Group",
    execute: async (sock, msg, args) => {
        const remoteJid = msg.key.remoteJid;

      
        if (!remoteJid?.endsWith("@g.us")) {
          return sock.sendMessage(remoteJid, {
            text: "This command only works in groups.",
          });
        }

      const metadata = await sock.groupMetadata(remoteJid);
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const admins = metadata.participants
          .filter((p) => p.admin)
          .map((p) => p.id);

        if (!admins.includes(senderJid) && !msg.key.fromMe) {
          return sock.sendMessage(remoteJid, { text: "Admin only." });
        }
      
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      let targetJid =
        ctxInfo?.participant ||
        (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);

      if (!targetJid && args[0]) {
        const num = args[0].replace(/\D/g, "");
        if (!num)
          return sock.sendMessage(remoteJid, { text: "Provide a valid number." });
        targetJid = `${num}@s.whatsapp.net`;
      }

      if (!targetJid) {
        return sock.sendMessage(remoteJid, {
          text: "Reply to a user, mention them, or use `.kick <number>`.",
        });
      }
      try{
        await sock.groupParticipantsUpdate(remoteJid, [targetJid], "promote");
        await sock.sendMessage(remoteJid, { text: "Promoted." });
      } catch (e) {
        console.error("promote error:", e);
        await sock.sendMessage(remoteJid, { text: "Failed to promote user." });
      }
    }
}