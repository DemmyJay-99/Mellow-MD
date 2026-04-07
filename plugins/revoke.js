import normaliseLid from "../lib/normaliseLid.js"

export default {
   name: "revoke",
   description: "Revoke group invite link",
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
      let senderJid = msg.key.participant || msg.key.remoteJid;
      if (senderJid.endsWith("@lid")) {
         const pn = await normaliseLid(sock, senderJid);
         senderJid = pn + "@s.whatsapp.net";
      }
      const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id)
      if (!admins.includes(senderJid)) {
         return sock.sendMessage(remoteJid, { text: "Admin only." });
      }
      await sock.groupRevokeInvite(remoteJid);
      await sock.sendMessage(remoteJid, { text: "Invite link reset" });
   }
}