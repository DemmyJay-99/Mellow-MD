import { allvars } from "../lib/index.js";

export default {
  name: "allvars",
  description: "Get all environment variables",
  isPublic: false,
  category: "Vars",
  usage: "allvars",
  execute: async (sock, msg, args) => {
    const vars = await allvars();
    const text = Object.entries(vars).map(([key, value]) => `${key} = ${value}`).join("\n");
    await sock.sendMessage(msg.key.remoteJid, {text: text});
  }
};
