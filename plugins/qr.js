import generateQR from "../lib/qr.js"

export default {
  name: "qr",
  description: "Generate QR code",
  isPublic: true,
  category: "Tools",
  usage: "qr <text>",
  execute: async (sock, msg, args, quotedMessage) => {
    try {
      let text;
      if (args[0]) {
        text = args.join(" ");
      } else if (quotedMessage) {
        text = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text;
      }
      if (!text) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "Please provide text to generate QR code",
        });
        return;
      }
      const qr = await generateQR(text);
      await sock.sendMessage(msg.key.remoteJid, {
        image: qr,
        caption: "Here is your QR code",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Error generating QR code: " + error.message,
      });
    }
  }
}