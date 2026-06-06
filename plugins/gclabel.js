export default {
  name: "gclabel",
  description: "Set a label for a group",
  category: "Group",
  usage: "gclabel <label>",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup} = mellow;
    if (!chatIDisGroup) {
      return await sock.sendMessage(chatID, {text: "This command can only be used in groups"});
    }
    const metadata = await sock.groupMetadata(chatID);
    const groupName = metadata.subject;
    const label = args.join(" ");
    if (!label) {
      await sock.sendMessage(chatID, {text: "Please provide a label"});
      return;
    }
    await sock.updateMemberLabel(chatID, label);
    await sock.sendMessage(chatID, {text: `Member label for ${groupName} set to ${label}`});
  },
};
