import normaliseJidToPN from "../lib/normaliseJidToPN.js";
export default {
  name: "gcdesc",
  description: "Change the group description",
  category: "Group",
  usage: "gcdesc <new description>",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, senderID, botID } = mellow;
    if (!chatID.endsWith("@g.us")) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(chatID);
    const senderJid = await normaliseJidToPN(senderID);
    const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
    if (!admins.includes(senderJid) && !msg.key.fromMe) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }

    if (!admins.includes(botID)) {
      return sock.sendMessage(chatID, {
        text: "I need to be an admin to change the group description.",
      });
    }
    const newName = args.join(" ");
    if (!newName) {
      return sock.sendMessage(chatID, {
        text: "Provide a new group description.",
      });
    }
    try {
      await sock.groupUpdateDescription(chatID, newName);
      await sock.sendMessage(chatID, {text: "Group description updated."});
    } catch (e) {
      console.error("gcname error:", e);
      await sock.sendMessage(chatID, {
        text: "Failed to update group description.",
      });
    }
  },
};
