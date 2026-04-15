import { decode } from "morsee";

export default {
  name: "demorse",
  description: "Convert morse code to text",
  isPublic: false,
  category: "Fun",
  usage: "demorse <morse code>",
  execute: async (sock, msg, args, quotedMessage) => {
    try {
      let text;
      if (args[0]) {
        text = args.join(" ");
      } else if (quotedMessage) {
        text =
          quotedMessage?.conversation ||
          quotedMessage?.extendedTextMessage?.text;
      }
      if (!text) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "Please provide morse code to convert to text",
        });
        return;
      }
      const demorse = decode(text);
      await sock.sendMessage(msg.key.remoteJid, {
        text: demorse,
      });
    } catch (error) {
      console.error("Error converting morse code to text:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Error converting morse code to text: " + error.message,
      });
    }
  },
};
