import normaliseLid from "../lib/normaliseLid.js";

export default {
  name: "demote",
  description: "Demote a user",
  isPublic: false,
  category: "Group",
  usage: "Reply to a user, mention them, or use `.demote <number>`.",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    if (!remoteJid?.endsWith("@g.us")) {
      return sock.sendMessage(remoteJid, {
        text: "This command only works in groups.",
      });
    }

    const metadata = await sock.groupMetadata(remoteJid);
    let senderJid = msg.key.participant || msg.key.remoteJid;
    if (senderJid.endsWith("@lid")) {
      const pn = await normaliseLid(sock, senderJid);
      senderJid = pn + "@s.whatsapp.net";
    }
    const admins = metadata.participants.filter((p) => p.admin || p.admin === "superadmin").map((p) => p.id);

    if (!admins.includes(senderJid)) {
      return sock.sendMessage(remoteJid, {text: "Admin only."});
    }

    const isBotAdmin = metadata.participants.find((p) => p.id === user)?.admin;

    if (!isBotAdmin) {
      return sock.sendMessage(remoteJid, {
        text: "I need to be an admin to promote users.",
      });
    }

    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || {};
    let targetJid = ctxInfo?.participant || (ctxInfo?.mentionedJid?.length ? ctxInfo.mentionedJid[0] : null);

    if (!targetJid && args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num) return sock.sendMessage(remoteJid, {text: "Provide a valid number."});
      targetJid = `${num}@s.whatsapp.net`;
    }

    if (!targetJid) {
      return sock.sendMessage(remoteJid, {
        text: "Reply to a user, mention them, or use `.promote <number>`.",
      });
    }

    if (targetJid.endsWith("@lid")) {
      const pn = await normaliseLid(sock, targetJid);
      targetJid = pn + "@s.whatsapp.net";
    }

    if (!admins.includes(targetJid)) {
      return sock.sendMessage(remoteJid, {text: "User cannot be demoted"});
    }

    // if (targetJid === user) {
    //   return sock.sendMessage(remoteJid, { text: "I can't promote myself." });
    // }

    try {
      await sock.groupParticipantsUpdate(remoteJid, [targetJid], "demote");
      await sock.sendMessage(remoteJid, {text: "Demoted."});
    } catch (e) {
      console.error("Demote error:", e);
      await sock.sendMessage(remoteJid, {text: "Failed to demote user."});
    }
  },
};
