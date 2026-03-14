export default {
  name: "invite",
  description: "Get group invite link",
  isPublic: false,
  category: "Group",
  execute: async (sock, msg) => {
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
    const inviteCode = await sock.groupInviteCode(remoteJid);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    await sock.sendMessage(remoteJid, { text: inviteLink });
  },
};
