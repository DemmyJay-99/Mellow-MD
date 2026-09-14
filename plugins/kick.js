import { isSenderAdmin } from "../lib/index.js";

export default {
  name: "kick",
  description: "Remove a user from the group",
  category: "Group",
  usage: "Reply to a user or mention them.",
  aliases: ["remove", "kickuser", "removeuser", 'k'],
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup, senderID, ctxInfo, botID } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }

    const isAdmin = await isSenderAdmin(sock, senderID, chatID);
    if (!isAdmin) {
      return sock.sendMessage(chatID, { text: "Admin only." });
    }

    let targetJid = ctxInfo?.participant || (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);

    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Reply to a user or mention them.",
      });
    }

    try {
      await sock.groupParticipantsUpdate(chatID, [targetJid], "remove");
      await sock.sendMessage(chatID, { text: "Removed." });
    } catch (e) {
      console.error("kick error:", e);
      await sock.sendMessage(chatID, { text: "Failed to remove user." });
    }
  },
};
