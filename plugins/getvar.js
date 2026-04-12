import { getvar } from "../lib/index.js"

export default {
   name: "getvar",
   description: "Get environment variables",
   isPublic: false,
   category: "Owner",
   usage: "getvar <variable>",
   execute: async (sock, msg, args) => {
      const variable = args[0];
      if (!variable) {
         await sock.sendMessage(msg.key.remoteJid, {text: "Please provide a variable."});
         return;
      }
      const value = await getvar(variable);
      await sock.sendMessage(msg.key.remoteJid, {text: `${variable.toUpperCase()} = ${value}`});
   }
}