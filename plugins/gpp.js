import { downloadContentFromMessage } from "@innovatorssoft/baileys";

export default {
  name: "gpp",
  description: "Set group profile picture",
  isPublic: false,
  category: "Group",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(remoteJid, {
        text: "This command only works in groups.",
      });
    }
    const quotedMessage =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const media = quotedMessage?.imageMessage;
    if (!quotedMessage || !quotedMessage.imageMessage) {
      return sock.sendMessage(remoteJid, {
        text: "Please quote an image to set as the group profile picture.",
      });
    }
    const stream = await downloadContentFromMessage(media, "image");
    let imageBuffer = Buffer.from([]);
    for await (const chunk of stream) {
      imageBuffer = Buffer.concat([imageBuffer, chunk]);
    }
    await sock.updateProfilePicture(remoteJid, imageBuffer);
  },
};
