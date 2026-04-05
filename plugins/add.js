export default {
  name: "add",
  description: "Add a user to the group",
  isPublic: false,
  category: "Group",
  execute: async (sock, msg, args, quotedMessage) => {
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

    const repliedMessage =
      quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text;

    let targetJid = repliedMessage + "@s.whatsapp.net";

    if (!targetJid && args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num)
        return sock.sendMessage(remoteJid, { text: "Provide a valid number." });
      targetJid = `${num}@s.whatsapp.net`;
    }

    if (!targetJid) {
      return sock.sendMessage(remoteJid, {
        text: "Reply to a user, mention them, or use `.add <number>`.",
      });
    }

    try {
      const res = await sock.groupParticipantsUpdate(
        remoteJid,
        [targetJid],
        "add",
      );
      const status = res?.[0]?.status;
      console.log(status);
      console.log(res);
      if (status === 200 || status === "200") {
        await sock.sendMessage(remoteJid, { text: "User added successfully." });
      } else {
        await sock.sendMessage(remoteJid, { text: "Failed to add user." });
      }
    } catch (e) {
      console.error("add error:", e);
      await sock.sendMessage(remoteJid, { text: "Failed to add user." });
    }
  },
};
