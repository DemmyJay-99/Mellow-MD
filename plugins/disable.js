import { disableCommand, getEnabled } from "../lib/perm.js";

export default {
  name: "disable",
  description: "Disable a command for a specific group",
  category: "Group",
  usage: "disable <command>",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup } = mellow;
    if (!chatIDisGroup) {
      return await sock.sendMessage(chatID, {
        text: "This command can only be used in groups",
      });
    }
    if (!args[0]) {
      return sock.sendMessage(chatID, {
        text: "Please provide a command name.\nExample: .disable ping",
      });
    }
    const command = args[0].toLowerCase();
    const current = getEnabled(chatID);
    if (!current.includes(command)) {
      return sock.sendMessage(chatID, {
        text: `*${command}* isn't enabled in this group.`,
      });
    }
    disableCommand(chatID, command);
    await sock.sendMessage(chatID, {
      text: `*${command}* command has been disabled for this group`
    })
  },
};
