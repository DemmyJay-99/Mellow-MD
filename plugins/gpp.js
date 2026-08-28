import {downloadContentFromMessage} from "@whiskeysockets/baileys";
import normaliseJidToPN from "../lib/normaliseJidToPN.js";
export default {
  name: "gpp",
  description: "Set group profile picture",
  category: "Group",
  usage: "Reply to an image with .gpp",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup, quotedMessage, senderID} = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(chatID);
    const senderJid = await normaliseJidToPN(sock, senderID);
    const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
    if (!admins.includes(senderJid)) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }
    const media = quotedMessage?.imageMessage;
    if (!quotedMessage || !quotedMessage.imageMessage) {
      return sock.sendMessage(chatID, {
        text: "Please quote an image to set as the group profile picture.",
      });
    }
    const stream = await downloadContentFromMessage(media, "image");
    let imageBuffer = Buffer.from([]);
    for await (const chunk of stream) {
      imageBuffer = Buffer.concat([imageBuffer, chunk]);
    }
    await sock.updateProfilePicture(chatID, imageBuffer);
  },
};
