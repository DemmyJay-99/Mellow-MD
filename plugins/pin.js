import { isSenderAdmin } from "../lib/index.js";
import { fetchGroupMetadata } from "../lib/index.js";
import { print } from "../lib/log.js";

export default {
  name: "pin",
  description: "Pin a message to the chat",
  usage: "Reply to a message with pin <time in days>",
  async execute(sock, msg, args, mellow) {
    const { chatID, chatIDisGroup, senderID, botID, ctxInfo, quotedMessage } = mellow;
    if (!quotedMessage) {
      await sock.sendMessage(chatID, { text: "Please reply to a message to pin it." });
      return;
    }
    const timeArg = args[0]
    const allowedArgs = [1, 7, 30];
    let time;
    if (timeArg) {
      const days = parseInt(timeArg);
      if (!allowedArgs.includes(days)) {
        await sock.sendMessage(chatID, { text: "Invalid time argument. Please provide a number of days. Allowed values: 1, 7, 30." });
        return;
      } else {
        time = days * 86400;
      }
    } else {
      time = 86400;
    }
    try {
      if (chatIDisGroup) {
        const metadata = await fetchGroupMetadata(sock, chatID);
        if (metadata.restrict) {
          const isAdmin = await isSenderAdmin(sock, senderID, chatID);
          if (!isAdmin) {
            await sock.sendMessage(chatID, { text: "Only admins can pin messages in this group." });
            return;
          }
          const botIsAdmin = await isSenderAdmin(sock, botID, chatID);
          if (!botIsAdmin) {
            await sock.sendMessage(chatID, { text: "I need to be an admin to pin messages." });
            return;
          }
          const ddd = botID === ctxInfo.participant;
          await sock.sendMessage(chatID, {
            type: 1,
            time,
            pin: {
              remoteJid: chatID,
              fromMe: ddd ? true : false,
              id: ctxInfo.stanzaId,
              participant: ctxInfo.participant,
            },
          });
        }
        return await sock.sendMessage(chatID, { text: `Pinned message for ${time / 86400} day(s)` });
      } else {
        await sock.sendMessage(chatID, {
          type: 1,
          time,
          pin: { remoteJid: chatID, fromMe: false, id: ctxInfo.stanzaId, participant: ctxInfo.participant },
        });
        return await sock.sendMessage(chatID, { text: `Pinned message for ${time / 86400} day(s)` });
      }
    } catch (error) {
      print("error", error.message);
      await sock.sendMessage(chatID, { text: "Failed to pin message. Please try again." });
    }
  },
};
