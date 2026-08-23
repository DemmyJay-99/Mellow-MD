import normaliseJidToPN from "../lib/normaliseJidToPN.js";

export default {
  name: "jid",
  description: "Get the JID of a user",
  category: "Dev",
  usage: "jid",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup } = mellow;
    if (chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: chatID,
      });
    } else {
      const newJid = (await normaliseJidToPN(sock, chatID)) + "@s.whatsapp.net";
      await sock.sendMessage(chatID, { text: newJid });
    }
  },
};
