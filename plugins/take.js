import { downloadContentFromMessage} from '@innovatorssoft/baileys'
import { StickerTypes, createSticker } from 'stickers-formatter'

export default {
  name: "take",
  description: "Change the sticker by updating it's metadata",
  usage: "Reply to a sticker with .take",
  category: "Media",
  isPublic: false,
  execute: async (sock, msg, args, quotedMessage) => {
    if (!quotedMessage) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Reply to a sticker with .take",
      });
      return;
    }
    const sticker = quotedMessage.stickerMessage;
    if (!sticker) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Reply to a sticker with .take",
      });
      return;
    }
     const [stickerNameRaw, stickerAuthorRaw] = (process.env.STICKER_PACKNAME || "").split(",");
    const stickerName = args[0] || stickerNameRaw || "Mellow MD";
    const author = args[1] || stickerAuthorRaw || "Mellow";
    const stream = await downloadContentFromMessage(sticker, "sticker");
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const newSticker = await createSticker(buffer, {
      pack: stickerName,
      author: author,
      type: StickerTypes.FULL,
      quality: 50,
      background: "transparent",
    });
    await sock.sendMessage(msg.key.remoteJid, { sticker: newSticker });
  }
};
