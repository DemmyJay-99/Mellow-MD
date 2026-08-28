import {reverseAudio, reverseVideo} from "../lib/ffmpeg.js";

export default {
  name: "reverse",
  description: "Reverse video or audio",
  category: "Media",
  usage: "Reply to a video or audio with .reverse",
  execute: async (sock, msg, args, mellow = {}) => {
    const {quotedMessage} = mellow;
    const mediaMessage = quotedMessage?.videoMessage || quotedMessage?.audioMessage;
    if (!mediaMessage) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "Reply to a video or audio message.",
      });
    }
    const {downloadContentFromMessage} = await import("@whiskeysockets/baileys");
    const type = quotedMessage.videoMessage ? "video" : "audio";
    const stream = await downloadContentFromMessage(mediaMessage, type);

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    try {
      let reversedBuffer;
      if (quotedMessage.videoMessage) {
        reversedBuffer = await reverseVideo(buffer, mediaMessage.mimetype.split("/")[1]);
      } else {
        reversedBuffer = await reverseAudio(buffer, mediaMessage.mimetype.split("/")[1]);
      }
      const sendOptions = {quoted: msg};
      if (quotedMessage.videoMessage) {
        sendOptions.video = reversedBuffer;
        sendOptions.mimetype = "video/mp4";
      } else {
        sendOptions.audio = reversedBuffer;
        sendOptions.mimetype = "audio/mpeg";
      }
      await sock.sendMessage(msg.key.remoteJid, sendOptions);
    } catch (e) {
      console.error("reverse error:", e);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Reversing failed.",
      });
    }
  },
};
