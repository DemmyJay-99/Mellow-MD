import normaliseJidToPN from "../lib/normaliseJidToPN.js";

export default {
  name: "demote",
  description: "Demote a user",
  category: "Group",
  usage: "Reply to a user, mention them, or use `.demote <number>`.",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup} = mellow;
    const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }

    const metadata = await sock.groupMetadata(chatID);
    let senderJid = msg.key.participant || msg.key.remoteJid;
    senderJid = (await normaliseJidToPN(sock, senderJid)) + "@s.whatsapp.net";
    const admins = metadata.participants.filter((p) => p.admin || p.admin === "superadmin").map((p) => p.id);

    if (!admins.includes(senderJid)) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }

    const isBotAdmin = metadata.participants.find((p) => p.id === user)?.admin;

    if (!isBotAdmin) {
      return sock.sendMessage(chatID, {
        text: "I need to be an admin to promote users.",
      });
    }

    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || {};
    let targetJid = ctxInfo?.participant || (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);

    if (!targetJid && args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num) return sock.sendMessage(chatID, {text: "Provide a valid number."});
      targetJid = num;
    }

    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Reply to a user, mention them, or use `.promote <number>`.",
      });
    }

    targetJid = (await normaliseJidToPN(sock, targetJid)) + "@s.whatsapp.net";
    if (!admins.includes(targetJid)) {
      return sock.sendMessage(chatID, {text: "User cannot be demoted"});
    }

    try {
      await sock.groupParticipantsUpdate(chatID, [targetJid], "demote");
      await sock.sendMessage(chatID, {text: "Demoted."});
    } catch (e) {
      console.error("Demote error:", e);
      await sock.sendMessage(chatID, {text: "Failed to demote user."});
    }
  },
};
