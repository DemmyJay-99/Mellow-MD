import { isSenderAdmin } from "../lib/index.js";

export default {
  name: "unmute",
  description: "Unmute the group",
  category: "Group",
  usage: "unmute",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, senderID, botID, chatIDisGroup } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, { text: "This command only works in groups." });
    }
    const senderIsAdmin = await isSenderAdmin(sock, senderID, chatID);
    if (!senderIsAdmin) {
      return sock.sendMessage(chatID, { text: "You are not an admin." });
    }
    const botIsAdmin = await isSenderAdmin(sock, botID, chatID);
    if (!botIsAdmin) {
      return sock.sendMessage(chatID, { text: "Bot is not an admin." });
    }
    try {
      await sock.groupSettingUpdate(chatID, "not_announcement");
      await sock.sendMessage(chatID, {
        text: `The group has been unmuted`,
      });
    } catch (error) {
      console.error(error.message);
      await sock.sendMessage(chatID, {
        text: `Failed to unmute group`,
      });
    }
  },
};
