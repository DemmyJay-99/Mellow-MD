import { disableCommand, getEnabled } from "../lib/perm.js";

export default {
  name: "disable",
  description: "Disable a command for a specific group",
  category: "Group",
  usage: "disable <command>",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
      return await sock.sendMessage(remoteJid, {
        text: "This command can only be used in groups",
      });
    }
    if (!args[0]) {
      return sock.sendMessage(remoteJid, {
        text: "Please provide a command name.\nExample: .disable ping",
      });
    }
    const command = args[0].toLowerCase();
    const current = getEnabled(remoteJid);
    if (!current.includes(command)) {
      return sock.sendMessage(remoteJid, {
        text: `*${command}* isn't enabled in this group.`,
      });
    }
    disableCommand(remoteJid, command);
    await sock.sendMessage(remoteJid, {
      text: `*${command}* command has been disabled for this group`
    })
  },
};
