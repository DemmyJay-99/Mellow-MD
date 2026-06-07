import generateQR from "../lib/qr.js";

export default {
  name: "qr",
  description: "Generate QR code",
  category: "Tools",
  usage: "qr <text>",
  execute: async (sock, msg, args, mellow = {}) => {
    try {
      const {quotedMessageText, chatID} = mellow;
      let text;
      if (args[0]) {
        text = args.join(" ");
      } else if (quotedMessageText) {
        text = quotedMessageText;
      }
      if (!text) {
        await sock.sendMessage(chatID, {
          text: "Please provide text to generate QR code",
        });
        return;
      }
      const qr = await generateQR(text);
      await sock.sendMessage(chatID, {
        image: qr,
        caption: "Here is your QR code",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      await sock.sendMessage(chatID, {
        text: "Error generating QR code: " + error.message,
      });
    }
  },
};
