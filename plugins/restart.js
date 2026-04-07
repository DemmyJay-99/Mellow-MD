import clearReact from "../lib/clearReact.js";

export default {
  name: "restart",
  description: "Restart the bot",
  isPublic: false,
  category: "Bot",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    await sock.sendMessage(remoteJid, { text: "Restarting..." });
    await clearReact(sock, msg);
    setTimeout(() => {
      process.exit(0);
    }, 1500);
  },
};
