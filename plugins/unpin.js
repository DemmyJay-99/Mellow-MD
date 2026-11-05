import { isSenderAdmin } from "../lib/index.js";
import { fetchGroupMetadata } from "../lib/index.js";
import { print } from "../lib/log.js";

export default {
  name: "unpin",
  description: "Unpin a message",
  usage: "Reply to a message with pin <time in days>",
  category: "Group",
  execute: async (sock, msg, args, mellow) => {
    const { chatID, chatIDisGroup, quotedMessage, senderID, botID, ctxInfo } = mellow;
    if (!quotedMessage) {
      await sock.sendMessage(chatID, { text: "Please reply to a message to unpin it." });
      return;
    }
    try {
      if (chatIDisGroup) {
        const metadata = await fetchGroupMetadata(sock, chatID);
        if (metadata.restrict) {
          const isAdmin = await isSenderAdmin(sock, senderID, chatID);
          if (!isAdmin) {
            await sock.sendMessage(chatID, { text: "Only admins can unpin messages in this group." });
            return;
          }
          const botIsAdmin = await isSenderAdmin(sock, botID, chatID);
          if (!botIsAdmin) {
            await sock.sendMessage(chatID, { text: "I need to be an admin to unpin messages." });
            return;
          }
          const ddd = botID === ctxInfo.participant;
          await sock.sendMessage(chatID, {
            type: 2,
            pin: {
              remoteJid: chatID,
              fromMe: ddd ? true : false,
              id: ctxInfo.stanzaId,
              participant: ctxInfo.participant,
            },
          });
        }
        return await sock.sendMessage(chatID, { text: `Unpinned message` });
      } else {
        await sock.sendMessage(chatID, {
          type: 2,
          pin: { remoteJid: chatID, fromMe: false, id: ctxInfo.stanzaId, participant: ctxInfo.participant },
        });
        return await sock.sendMessage(chatID, { text: `Unpinned message` });
      }
    } catch (error) {
      print("error", error.message);
      await sock.sendMessage(chatID, { text: "Failed to unpin message. Please try again." });
    }
  },
};
