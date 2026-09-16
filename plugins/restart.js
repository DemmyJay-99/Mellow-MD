import { clearReact } from "../lib/index.js";
import { isSudo } from "../lib/sudo.js";

export default {
  name: "restart",
  description: "Restart the bot",
  category: "Bot",
  usage: "restart",
  aliases: ["reboot", "reload", "rs"], 
  ownerOnly: true,
  execute: async (sock, msg, agrs, mellow = {}) => {
    const { chatID, fromMe, senderID } = mellow;
    const isOwner = fromMe || isSudo(senderID);
    if (!isOwner) return;
    await sock.sendMessage(chatID, { text: "Restarting..." });
    await clearReact(sock, msg);
    setTimeout(() => {
      process.exit(0);
    }, 1500);
  },
};
