export default {
   name: "tag",
   description: "Tag all members",
   isPublic: false,
   category: "Group",
   execute: async (sock, msg, args) => {
      const remoteJid = msg.key.remoteJid;
      if (!remoteJid.endsWith("@g.us")) {
         return sock.sendMessage(remoteJid, {
            text: "This command only works in groups.",
         });
      }
      const metadata = await sock.groupMetadata(remoteJid);
      const members = metadata.participants.map((p) => p.id);
      const mentionText = members.map((jid) => "@" + jid.split("@")[0]).join(" ");
      await sock.sendMessage(remoteJid, { text: mentionText, mentions: members });
   }
}