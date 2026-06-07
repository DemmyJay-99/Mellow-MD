import { enableCommand, getEnabled } from "../lib/perm.js";

export default {
  name: "enable",
  description: "Enable a command for a specific group",
  category: "Group",
  usage: "enable <command>",
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
    enableCommand(chatID, command);
    await sock.sendMessage(chatID, {text: `Command ${command} enabled for this group`});
  },
};
