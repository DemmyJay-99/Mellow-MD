import { isSenderAdmin } from "../lib/index.js";


export default {
  name: "promote",
  description: "Promote a user to admin",
  category: "Group",
  usage: "Reply to a user or mention them.",
  aliases: ["promoteuser", "makeadmin", 'prom'],
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup, senderID, ctxInfo, botID} = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }

    const isAdmin = await isSenderAdmin(sock, senderID, chatID);

    if (!isAdmin) {
      return sock.sendMessage(chatID, { text: "Admin only." });
    }

    const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    const isBotAdmin = await isSenderAdmin(sock, botID, chatID);

    if (!isBotAdmin) {
      return sock.sendMessage(chatID, {
        text: "I need to be an admin to promote users.",
      });
    }

    let targetJid = ctxInfo?.participant || (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);

    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Reply to a user or mention them.",
      });
    }

    const isTargetAdmin = await isSenderAdmin(sock, targetJid, chatID);
    if (isTargetAdmin) {
      return sock.sendMessage(chatID, { text: "User is already an admin." });
    }

    if (targetJid === botID) {
      return sock.sendMessage(chatID, {text: "I can't promote myself."});
    }

    try {
      await sock.groupParticipantsUpdate(chatID, [targetJid], "promote");
      await sock.sendMessage(chatID, {text: "Promoted."});
    } catch (e) {
      console.error("promote error:", e);
      await sock.sendMessage(chatID, {text: "Failed to promote user."});
    }
  },
};
