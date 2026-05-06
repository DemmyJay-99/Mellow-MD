import { enableCommand, getEnabled } from "../lib/perm.js";

export default {
  name: "enable",
  description: "Enable a command for a specific group",
  category: "Group",
  usage: "enable <command>",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
     return await sock.sendMessage(remoteJid, {text: "This command can only be used in groups"});
    }
    if (!args[0]) {
      const list = getEnabled(remoteJid);
      const display = list.length ? list.join('\n') : 'none yet';
      return sock.sendMessage(remoteJid, {
        text: ` *Enabled commands in this group:*\n${display}`
      });
    }
    const command = args[0].toLowerCase();
    enableCommand(remoteJid, command);
    await sock.sendMessage(msg.key.remoteJid, {text: `Command ${command} enabled for this group`});
  },
};
