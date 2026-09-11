import { isSenderAdmin } from "../lib/index.js";

export default {
  name: "demote",
  description: "Demote a user",
  category: "Group",
  usage: "Reply to a user or mention them.",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup, senderID, botID, ctxInfo } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }

    const isAdmin = await isSenderAdmin(sock, senderID, chatID);

    if (!isAdmin) {
      return sock.sendMessage(chatID, { text: "Admin only." });
    }

    const isBotAdmin = await isSenderAdmin(sock, botID, chatID);

    if (!isBotAdmin) {
      return sock.sendMessage(chatID, {
        text: "I need to be an admin to demote users.",
      });
    }

    let targetid = ctxInfo?.participant || (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);

    if (!targetid) {
      return sock.sendMessage(chatID, {
        text: "Reply to a user or mention them.",
      });
    }
    const isTargetAdmin = await isSenderAdmin(sock, targetid, chatID);
    if (!isTargetAdmin) {
      return sock.sendMessage(chatID, { text: "User cannot be demoted" });
    }

    try {
      await sock.groupParticipantsUpdate(chatID, [targetid], "demote");
      await sock.sendMessage(chatID, { text: "Demoted." });
    } catch (e) {
      console.error("Demote error:", e);
      await sock.sendMessage(chatID, { text: "Failed to demote user." });
    }
  },
};
