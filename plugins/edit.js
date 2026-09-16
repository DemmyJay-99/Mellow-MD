export default {
  name: "edit",
  description: "Edit quoted message",
  category: "Utility",
  usage: "Reply to a message with edit",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, ctxInfo } = mellow;
    if (!ctxInfo) {
      return await sock.sendMessage(chatID, { text: "Reply to a message with edit" });
    }
    const sentence = args.join(" ");
    if (!sentence) {
      return await sock.sendMessage(chatID, { text: "Provide the new message" });
    }
    await sock.sendMessage(chatID, {
      text: sentence,
      edit: {
        remoteJid: chatID,
        fromMe: true,
        id: ctxInfo.stanzaId,
        participant: ctxInfo.participant,
      },
    });
  },
};
