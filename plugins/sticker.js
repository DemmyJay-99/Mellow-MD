import {StickerTypes} from "stickers-formatter";
import id from "../lib/id.js";
export default {
  name: "sticker",
  description: "Convert an image or video to a sticker",
  isPublic: false,
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

    const stream = await downloadContentFromMessage(mediaMessage, type);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }    
    const buffer = Buffer.concat(chunks);
    const [stickerNameRaw, stickerAuthorRaw] = (process.env.STICKER_PACKNAME || "").split(",");
    const stickerName = stickerNameRaw || "Mellow MD";
    const stickerAuthor = stickerAuthorRaw || "Mellow";
    const sticker = await createSticker(buffer, {
      pack: stickerName,
      author: stickerAuthor,
      type: StickerTypes.FULL,
      id: id,
      quality: 50,
      background: "transparent",
    });
    await sock.sendMessage(msg.key.remoteJid, {sticker: sticker});
  },
};
