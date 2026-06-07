export default {
  name: "block",
  description: "Block a user on WhatsApp",
  category: "Owner",
  usage: "Reply to a user, mention them, or use `.block <number>`.",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, ctxInfo } = mellow;
    let targetJid;
    if (ctxInfo?.participant) {
      targetJid = ctxInfo.participant;
    } else if (ctxInfo?.mentionedJid?.length) {
      targetJid = ctxInfo.mentionedJid[0];
    } else if (args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num) {
        await sock.sendMessage(chatID, {
          text: "Provide a valid number.",
        });
        return;
      }
      targetJid = num + "@s.whatsapp.net";
    } else {
      await sock.sendMessage(chatID, {
        text: "Reply to a user or mention one, or use `.block <number>`.",
      });
      return;
    }

    try {
      await sock.updateBlockStatus(targetJid, "block");
      await sock.sendMessage(chatID, {
        text: `Blocked`,
      });
    } catch (err) {
      console.error("block error:", err);
      await sock.sendMessage(chatID, {
        text: "Failed to block user.",
      });
    }
  },
};
