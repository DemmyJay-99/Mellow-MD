import normaliseJidToPN from "../lib/normaliseJidToPN.js";
import normaliseLid from "../lib/normaliseLid.js";

export default {
  name: "kick",
  description: "Remove a user from the group",
  category: "Group",
  usage: "Reply to a user, mention them, or use `.kick <number>`.",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup, senderID, ctxInfo} = mellow;
    const remoteJid = msg.key.remoteJid;

    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }

    const metadata = await sock.groupMetadata(chatID);
    const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
    const senderJid = await normaliseJidToPN(sock, senderID) + "@s.whatsapp.net";
    if (!admins.includes(senderJid)) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }

    let targetJid = ctxInfo?.participant || (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);
    targetJid = await normaliseJidToPN(sock, targetJid);

    if (!targetJid && args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num) return sock.sendMessage(chatID, {text: "Provide a valid number."});
      targetJid = `${num}@s.whatsapp.net`;
    }

    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Reply to a user, mention them, or use `.kick <number>`.",
      });
    }

    try {
      await sock.groupParticipantsUpdate(chatID, [targetJid], "remove");
      await sock.sendMessage(chatID, {text: "Removed."});
    } catch (e) {
      console.error("kick error:", e);
      await sock.sendMessage(chatID, {text: "Failed to remove user."});
    }
  },
};
