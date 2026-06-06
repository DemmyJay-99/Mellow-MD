import normaliseJidToPN from "../lib/normaliseJidToPN";

export default {
  name: "gcname",
  description: "Change the group name",
  category: "Group",
  usage: "gcname <new name>",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, senderID, chatIDisGroup, botID} = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(chatID);
    const senderJid = await normaliseJidToPN(sock, senderID);
    const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
    if (!admins.includes(senderJid) && !msg.key.fromMe) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }

    if (!admins.includes(botID)) {
      return sock.sendMessage(chatID, {
        text: "I need to be an admin to change the group name.",
      });
    }
    const newName = args.join(" ");
    if (!newName) {
      return sock.sendMessage(chatID, {text: "Provide a new group name."});
    }
    try {
      await sock.groupUpdateSubject(chatID, newName);
      await sock.sendMessage(chatID, {text: "Group name updated."});
    } catch (e) {
      console.error("gcname error:", e);
      await sock.sendMessage(chatID, {
        text: "Failed to update group name.",
      });
    }
  },
};
