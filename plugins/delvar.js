import {delvar} from "../lib/index.js";

export default {
  name: "delvar",
  description: "Delete environment variables",
  category: "Vars",
  usage: "delvar <variable>",
  execute: async (sock, msg, args) => {
    const variable = args[0];
    if (!variable) {
      await sock.sendMessage(msg.key.remoteJid, {text: "Please provide a variable."});
      return;
    }
    await delvar(variable);
    await sock.sendMessage(msg.key.remoteJid, {text: `Deleted ${variable.toUpperCase()}`});
  },
};
