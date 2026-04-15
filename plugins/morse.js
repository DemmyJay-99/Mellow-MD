import { encode } from "morsee";

export default {
  name: "morse",
  description: "Convert text to morse code",
  isPublic: false,
  category: "Fun",
  usage: "morse <text>",
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
          text: "Please provide text to convert to morse code",
        });
        return;
      }
      const morse = encode(text);
      await sock.sendMessage(msg.key.remoteJid, {
        text: morse,
      });
    } catch (error) {
      console.error("Error converting text to morse code:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Error converting text to morse code: " + error.message,
      });
    }
  },
};
