import { toAudio } from "../lib/ffmpeg.js";
export default {
  name: "mp3",
  description: "Convert video to MP3",
  category: "Media",
  usage: "Reply to a video/audio or document message with .mp3 to convert it to MP3",
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessage, chatID } = mellow;
    try {
      const mediaMessage = quotedMessage?.videoMessage || quotedMessage?.documentMessage || quotedMessage?.audioMessage;
      if (!mediaMessage) {
        return sock.sendMessage(chatID, {
          text: "Reply to a video or document message.",
        });
      }
      const { downloadContentFromMessage } = await import("@whiskeysockets/baileys");
      let type;
      if (quotedMessage?.videoMessage) type = "video";
      else if (quotedMessage?.documentMessage) type = "document";
      else if (quotedMessage?.audioMessage) type = "audio";
      const stream = await downloadContentFromMessage(mediaMessage, type);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const audioBuffer = await toAudio(buffer, mediaMessage.mimetype.split("/")[1]);
      await sock.sendMessage(chatID, { audio: audioBuffer, mimetype: "audio/mpeg" }, { quoted: msg });
    } catch (e) {
      console.error("mp3 error:", e);
      await sock.sendMessage(chatID, {
        text: "Conversion to MP3 failed.",
      });
    }
  },
};
