import normaliseLid from "../lib/normaliseLid.js";

export default {
  name: "gcname",
  description: "Change the group name",
  isPublic: false,
  category: "Group",
  usage: "gcname <new name>",
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
        text: "I need to be an admin to change the group name.",
      });
    }
    const newName = args.join(" ");
    if (!newName) {
      return sock.sendMessage(remoteJid, {text: "Provide a new group name."});
    }
    try {
      await sock.groupUpdateSubject(remoteJid, newName);
      await sock.sendMessage(remoteJid, {text: "Group name updated."});
    } catch (e) {
      console.error("gcname error:", e);
      await sock.sendMessage(remoteJid, {
        text: "Failed to update group name.",
      });
    }
  },
};
