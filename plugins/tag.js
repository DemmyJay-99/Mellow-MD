export default {
  name: "tag",
  description: "Tag all members",
  category: "Group",
  usage: "tag all|admins|nonadmins or reply to a message with tag",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, quotedMessage, chatIDisGroup, quotedMessageText} = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(chatID);
    const members = metadata.participants.map((p) => p.id);
    const message = args.join(" ");
    const options = ["all", "admins", "nonadmins"];
    if (!message && !quotedMessageText) {
      return sock.sendMessage(chatID, {
        text: "Provide a message to tag members with.",
      });
    } else if (message === options[0]) {
      const mentions = members.map((member) => `* @${member.split("@")[0]}`).join("\n");
      await sock.sendMessage(chatID, {
        text: mentions,
        mentions: members,
      });
    } else if (message === options[1]) {
      const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
      const mentions = admins.map((admin) => `* @${admin.split("@")[0]}`).join("\n");
      await sock.sendMessage(chatID, {
        text: mentions,
        mentions: admins,
      });
    } else if (message === options[2]) {
      const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
      const nonAdmins = members.filter((member) => !admins.includes(member));
      const mentions = nonAdmins.map((nonAdmin) => `* @${nonAdmin.split("@")[0]}`).join("\n");
      await sock.sendMessage(chatID, {
        text: mentions,
        mentions: nonAdmins,
      });
    } else if (quotedMessageText) {
      await sock.sendMessage(chatID, {
        text: `${quotedMessageText}`,
        mentions: members,
      });
    } else if (!options.includes(message)) {
      await sock.sendMessage(chatID, {
        text: `${message}`,
        mentions: members,
      });
    }
  },
};
