import normaliseJidToPN from "../lib/normaliseJidToPN.js";

export default {
  name: "promote",
  description: "Promote a user to admin",
  category: "Group",
  usage: "Reply to a user, mention them, or use `.promote <number>`.",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup, senderID, ctxInfo} = mellow;
    const remoteJid = msg.key.remoteJid;

    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }

    const metadata = await sock.groupMetadata(chatID);
    const senderJid = await normaliseJidToPN(sock, senderID) + "@s.whatsapp.net";
    const admins = metadata.participants.filter((p) => p.admin || p.admin === "superadmin").map((p) => p.id);
    if (!admins.includes(senderJid)) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }

    const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    const isBotAdmin = metadata.participants.find((p) => p.id === user)?.admin;

    if (!isBotAdmin) {
      return sock.sendMessage(chatID, {
        text: "I need to be an admin to promote users.",
      });
    }

    let targetJid = ctxInfo?.participant || (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);

    if (!targetJid && args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num) return sock.sendMessage(chatID, {text: "Provide a valid number."});
      targetJid = `${num}@s.whatsapp.net`;
    }

    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Reply to a user, mention them, or use `.promote <number>`.",
      });
    }

  targetJid = await normaliseJidToPN(sock, targetJid) + "@s.whatsapp.net";

    if (admins.includes(targetJid)) {
      return sock.sendMessage(chatID, {text: "User is already an admin."});
    }

    if (targetJid === user) {
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
