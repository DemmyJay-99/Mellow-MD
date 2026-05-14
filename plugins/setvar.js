import { setvar } from "../lib/index.js";

export default {
  name: "setvar",
  description: "Set environment variables",
  category: "Vars",
  usage: "setvar <variable>=<value>",
  execute: async (sock, msg, args) => {
    const fullText = args.join(" ");
    const equalIndex = fullText.indexOf("=");

    if (equalIndex === -1) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: "Please provide a variable and a value separated by =.",
      });
    }

    const variable = fullText.substring(0, equalIndex).trim();
    const value = fullText.substring(equalIndex + 1).trim();

    if (!variable || !value) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: "Please provide a variable and a value.",
      });
    }
    await setvar(variable, value);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Set ${variable.toUpperCase()} to ${value}`,
    });
  },
};
