import {decode} from "morsee";

export default {
  name: "demorse",
  description: "Convert morse code to text",
  category: "Fun",
  usage: "demorse <morse code>",
  execute: async (sock, msg, args, mellow = {}) => {
    try {
      const {quotedMessage, quotedMessageText, chatID} = mellow;
      let text;
      if (args[0]) {
        text = args.join(" ");
      } else if (quotedMessage) {
        text = quotedMessageText;
      }
      if (!text) {
        await sock.sendMessage(chatID, {
          text: "Please provide morse code to convert to text",
        });
        return;
      }
      const demorse = decode(text);
      await sock.sendMessage(chatID, {
        text: demorse,
      });
    } catch (error) {
      console.error("Error converting morse code to text:", error);
      await sock.sendMessage(chatID, {
        text: "Error converting morse code to text: " + error.message,
      });
    }
  },
};
