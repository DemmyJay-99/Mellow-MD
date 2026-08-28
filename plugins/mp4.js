import {toVideo} from "../lib/ffmpeg.js";

export default {
  name: "mp4",
  description: "Convert video to mp4 format",
  usage: ".mp4 <video> or reply to a video with .mp4",
  category: "Media",
  execute: async (sock, msg, args, mellow = {}) => {
    const {quotedMessage, chatID} = mellow;
    const mediaMessage = quotedMessage?.videoMessage || quotedMessage?.documentMessage;
    if (!mediaMessage) {
      return await sock.sendMessage(chatID, {
        text: "Reply to a video or document message.",
      });
    }
    try {
      const {downloadContentFromMessage} = await import("@whiskeysockets/baileys");
      const stream = await downloadContentFromMessage(mediaMessage, "video");
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const videoBuffer = await toVideo(buffer, mediaMessage.mimetype.split("/")[1]);
      await sock.sendMessage(chatID, {video: videoBuffer, mimetype: "video/mp4"}, {quoted: msg});
    } catch (e) {
      console.error("tomp4 error:", e);
      await sock.sendMessage(chatID, {
        text: "Conversion to MP4 failed.",
      });
    }
  },
};
