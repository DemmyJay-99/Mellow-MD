import { StickerTypes } from "stickers-formatter";
import { fetchBuffer } from "../lib/index.js";
import id from "../lib/id.js";
import { getDurationFromFile, trimVideo } from "../lib/ffmpeg.js";
import store from "../lib/store.js";
import normaliseJidToPN from "../lib/normaliseJidToPN.js";
export default {
  name: "sticker",
  description: "Convert an image, text or video to a sticker",
  category: "Media",
  usage: "Reply to an image or video message with .sticker",
  aliases: ["s"],
  execute: async (sock, msg, args, mellow = {}) => {
    const { createSticker } = await import("stickers-formatter");
    const { downloadContentFromMessage } = await import("@whiskeysockets/baileys");
    const { chatID, quotedMessage, quotedMessageText, ctxInfo } = mellow;
    const mediaMessage = quotedMessage?.imageMessage || quotedMessage?.videoMessage || quotedMessage?.documentMessage;
    let sticker;
    const [stickerNameRaw, stickerAuthorRaw] = (process.env.STICKER_PACKNAME || "").split(",");
    const stickerName = stickerNameRaw || "Mellow MD";
    const stickerAuthor = stickerAuthorRaw || "https://github.com/DemmyJay-99/Mellow-MD";
  
    if (mediaMessage) {
      let type = quotedMessage?.imageMessage ? "image" : quotedMessage?.videoMessage ? "video" : "document";
      const isVideo = type === "video";
      // const isGif = quotedMessage?.videoMessage?.gifPlayback;
      const stream = await downloadContentFromMessage(mediaMessage, type);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      let buffer = Buffer.concat(chunks);
      if (isVideo) {
        const duration = await getDurationFromFile(buffer);
        if (duration > 5) {
          buffer = await trimVideo(buffer, "mp4", 0, 5);
        }
      }
      sticker = await createSticker(buffer, {
        pack: stickerName,
        author: stickerAuthor,
        type: StickerTypes.CROPPED,
        id: id,
        quality: 50,
      });
      if (sticker.length > 500 * 1024) {
        return sock.sendMessage(chatID, {
          text: "Sticker is too large to send.",
        });
      }
    } else if (quotedMessageText) {
      const { chatBubbleSticker } = await import("../lib/sticker.js");
      const lid = ctxInfo.participant;
      const pfpUrl = await sock.profilePictureUrl(lid);
      const pfp = await fetchBuffer(pfpUrl);
      const contact = await store.getContact(lid);
      const name =
        contact?.notify || contact?.name || contact?.verified_name || (await normaliseJidToPN(sock, lid)) || "User";
      const buffer = await chatBubbleSticker(quotedMessageText, { name, avatar: pfp, bg: null });
      sticker = await createSticker(buffer, {
        pack: "Mellow MD",
        author: "https://github.com/DemmyJay-99/Mellow-MD",
        type: StickerTypes.FULL,
        id: id,
        quality: 50,
        background: "transparent"
      });
    } else {
      return sock.sendMessage(chatID, {
        text: "Please reply to an image, video, or text message to create a sticker.",
      });
    }
    await sock.sendMessage(chatID, { sticker: sticker });
  },
};
