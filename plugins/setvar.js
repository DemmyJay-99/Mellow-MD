import {setvar} from "../lib/index.js";

export default {
  name: "setvar",
  description: "Set environment variables",
  category: "Vars",
  usage: "setvar <variable>=<value>",
  execute: async (sock, msg, args) => {
    if (!args.join(" ").includes("=")) {
      return await sock.sendMessage(msg.key.remoteJid, {text: "Please provide a variable and a value separated by =."});
    }
    const text = args.join(" ").split("=");
    const variable = text[0].trim();
    const value = text[1].trim();
    if (!variable || !value) {
      await sock.sendMessage(msg.key.remoteJid, {text: "Please provide a variable and a value."});
      return;
    }
    await setvar(variable, value);
    await sock.sendMessage(msg.key.remoteJid, {text: `Set ${variable.toUpperCase()} to ${value}`});
  },
};
