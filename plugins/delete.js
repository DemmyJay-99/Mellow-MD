import { isSenderAdmin } from "../lib/index.js";

export default {
  name: "delete",
  description: "Delete quoted message",
  category: "Utility",
  usage: "Reply to a message with delete",
  aliases: ["dlt"],
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup, senderID, botID, ctxInfo } = mellow;
    try {
      if (!ctxInfo) {
        return await sock.sendMessage(chatID, { text: "Reply to a message with edit" });
      }
      if (chatIDisGroup) {
        const senderIsAdmin = await isSenderAdmin(sock, senderID, chatID);
        if (!senderIsAdmin) {
          return await sock.sendMessage(chatID, { text: "Admin Only" });
        }
        const botIsAdmin = await isSenderAdmin(sock, botID, chatID);
        if (!botIsAdmin) {
          return await sock.sendMessage(chatID, { text: "Admin Only" });
        }
        await sock.sendMessage(chatID, {
          delete: {
            remoteJid: chatID,
            fromMe: false,
            id: ctxInfo.stanzaId,
            participant: ctxInfo.participant,
          },
        });
        await sock.sendMessage(chatID, { text: "Deleted" });
      } else {
        const ddd = botID === ctxInfo.participant;
        await sock.sendMessage(chatID, {
          delete: {
            remoteJid: chatID,
            fromMe: ddd ? ddd : false,
            id: ctxInfo.stanzaId,
            participant: ctxInfo.participant,
          },
        });
        await sock.sendMessage(chatID, { text: "Deleted" });
      }
    } catch (error) {
      console.log("Failed to delete message");
    }
  },
};
