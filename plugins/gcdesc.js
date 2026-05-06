import normaliseLid from "../lib/normaliseLid.js";

export default {
  name: "gcdesc",
  description: "Change the group description",
  category: "Group",
  usage: "gcdesc <new description>",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(remoteJid, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(remoteJid);
    let senderJid = msg.key.participant || msg.key.remoteJid;
    if (senderJid.endsWith("@lid")) {
      let pn = await normaliseLid(sock, senderJid);
      senderJid = pn + "@s.whatsapp.net";
    }
    const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
    if (!admins.includes(senderJid) && !msg.key.fromMe) {
      return sock.sendMessage(remoteJid, {text: "Admin only."});
    }

    const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    if (!admins.includes(botJid)) {
      return sock.sendMessage(remoteJid, {
        text: "I need to be an admin to change the group description.",
      });
    }
    const newName = args.join(" ");
    if (!newName) {
      return sock.sendMessage(remoteJid, {
        text: "Provide a new group description.",
      });
    }
    try {
      await sock.groupUpdateDescription(remoteJid, newName);
      await sock.sendMessage(remoteJid, {text: "Group description updated."});
    } catch (e) {
      console.error("gcname error:", e);
      await sock.sendMessage(remoteJid, {
        text: "Failed to update group description.",
      });
    }
  },
};
