import { enableCommand, getEnabled } from "../lib/perm.js";

export default {
  name: "enable",
  description: "Enable a command for a specific group",
  category: "Group",
  usage: "enable <command>",
  ownerOnly: true,
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup } = mellow;
    if (!chatIDisGroup) {
      return await sock.sendMessage(chatID, {text: "This command can only be used in groups"});
    }
    if (!args[0]) {
      const list = getEnabled(chatID);
      const display = list.length ? list.join('\n') : 'none yet';
      return sock.sendMessage(chatID, {
        text: ` *Enabled commands in this group:*\n${display}`
      });
    }
    const command = args[0].toLowerCase();
    const result = await enableCommand(chatID, command);
    if (result.success) {
      await sock.sendMessage(chatID, {text: `Command ${command} enabled for this group`});
    } else if (result.message === 'not_exist.') {
      await sock.sendMessage(chatID, {text: "That command does not exist."});
    } else if (result.message === 'owner_only.') {
      await sock.sendMessage(chatID, {text: "That command is owner-only and cannot be enabled for groups."});
    }
  },
};
