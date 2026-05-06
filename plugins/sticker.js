import {StickerTypes} from "stickers-formatter";
import id from "../lib/id.js";
import {getDurationFromFile} from "../lib/ffmpeg.js";
export default {
  name: "sticker",
  description: "Convert an image or video to a sticker",
  category: "Media",
  usage: "Reply to an image or video message with .sticker",
  execute: async (sock, msg, args, quotedMessage) => {
    const {createSticker} = await import("stickers-formatter");
    const {downloadContentFromMessage} = await import("@innovatorssoft/baileys");
    const mediaMessage = quotedMessage?.imageMessage || quotedMessage?.videoMessage || quotedMessage?.documentMessage;
    if (!mediaMessage) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "Reply to an image or video message.",
      });
    }
    let type = quotedMessage?.imageMessage ? "image" : quotedMessage?.videoMessage ? "video" : "document";
    const isVideo = type === "video";
    const isGif = quotedMessage?.videoMessage?.gifPlayback;
    const stream = await downloadContentFromMessage(mediaMessage, type);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    if (isVideo) {
      const duration = getDurationFromFile(buffer);
      if (duration > 5) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "GIF/videos must be 5 seconds or less.",
        });
      }
    }
    const [stickerNameRaw, stickerAuthorRaw] = (process.env.STICKER_PACKNAME || "").split(",");
    const stickerName = stickerNameRaw || "Mellow MD";
    const stickerAuthor = stickerAuthorRaw || "Mellow";
    const sticker = await createSticker(buffer, {
      pack: stickerName,
      author: stickerAuthor,
      type: StickerTypes.CROPPED,
      id: id,
      quality: 50,
    });
    if (sticker.length > 500 * 1024) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "Sticker is too large to send.",
      });
    }
    await sock.sendMessage(msg.key.remoteJid, {sticker: sticker});
  },
};
