export default {
  name: "rmpp",
  description: "Remove profile picture",
  category: "Owner",
  usage: "Reply to an image with .rmpp",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup} = mellow;
    if (!chatIDisGroup) {
      const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      await sock.removeProfilePicture(user);
      await sock.sendMessage(chatID, {text: "Profile picture removed"});
      return;
    }
    await sock.removeProfilePicture(chatID);
    await sock.sendMessage(chatID, {text: "Profile picture removed"});
  },
};
