import {downloadContentFromMessage} from "@innovatorssoft/baileys";

export default {
  name: "addpp",
  description: "Add profile picture",
  category: "Owner",
  usage: "Reply to an image with .addpp",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, quotedMessage } = mellow;
    const media = quotedMessage?.imageMessage;
    if (!media) {
      await sock.sendMessage(chatID, {
        text: "Reply to an image with .addpp",
      });
      return;
    }
    const stream = await downloadContentFromMessage(media, "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    await sock.updateProfilePicture(chatID, buffer);
    await sock.sendMessage(chatID, {text: "Profile picture updated"});
  },
};
