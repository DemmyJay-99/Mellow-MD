import {encode} from "morsee";

export default {
  name: "morse",
  description: "Convert text to morse code",
  category: "Fun",
  usage: "morse <text>",
  execute: async (sock, msg, args, mellow = {}) => {
    try {
      let text;
      const {quotedMessageText, chatID} = mellow;
      if (args[0]) {
        text = args.join(" ");
      } else if (quotedMessageText) {
        text = quotedMessageText;
      }
      if (!text) {
        await sock.sendMessage(chatID, {
          text: "Please provide text to convert to morse code",
        });
        return;
      }
      const morse = encode(text);
      await sock.sendMessage(chatID, {
        text: morse,
      });
    } catch (error) {
      console.error("Error converting text to morse code:", error);
      await sock.sendMessage(chatID, {
        text: "Error converting text to morse code: " + error.message,
      });
    }
  },
};
