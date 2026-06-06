import normaliseJidToPN from "../lib/normaliseJidToPN.js";

export default {
  name: "revoke",
  description: "Revoke group invite link",
  category: "Group",
  usage: "revoke",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup, senderID} = mellow;
    if (!chatIDisGroup){
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(chatID);
    const senderJid = await normaliseJidToPN(sock, senderID) + "@s.whatsapp.net";
    const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
    if (!admins.includes(senderJid)) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }
    await sock.groupRevokeInvite(chatID);
    await sock.sendMessage(chatID, {text: "Invite link reset"});
  },
};
