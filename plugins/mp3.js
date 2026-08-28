import {toAudio} from "../lib/ffmpeg.js";
export default {
  name: "mp3",
  description: "Convert video to MP3",
  category: "Media",
  usage: "Reply to a video or document message with .mp3 to convert it to MP3",
  execute: async (sock, msg, args, mellow = {}) => {
    try {
      const {quotedMessage, chatID} = mellow;
      const mediaMessage = quotedMessage?.videoMessage || quotedMessage?.documentMessage;
      if (!mediaMessage) {
        return sock.sendMessage(chatID, {
          text: "Reply to a video or document message.",
        });
      }
      const {downloadContentFromMessage} = await import("@whiskeysockets/baileys");
      const stream = await downloadContentFromMessage(mediaMessage, "video");
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const audioBuffer = await toAudio(buffer, mediaMessage.mimetype.split("/")[1]);
      await sock.sendMessage(chatID, {audio: audioBuffer, mimetype: "audio/mpeg"}, {quoted: msg});
    } catch (e) {
      console.error("tomp3 error:", e);
      await sock.sendMessage(chatID, {
        text: "Conversion to MP3 failed.",
      });
    }
  },
};
