export default {
  name: "rmpp",
  description: "Remove profile picture",
  category: "Owner",
  usage: "rmpp",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup, botID, senderID } = mellow;
    if (!chatIDisGroup && senderID === botID) {
      await sock.removeProfilePicture(botID);
      await sock.sendMessage(chatID, { text: "Profile picture removed" });
      return;
    }
    await sock.removeProfilePicture(chatID);
    await sock.sendMessage(chatID, { text: "Profile picture removed" });
  },
};
