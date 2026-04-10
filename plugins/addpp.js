import { downloadContentFromMessage } from "@innovatorssoft/baileys";

export default {
  name: "addpp",
  description: "Add profile picture",
  isPublic: false,
  category: "Owner",
  usage: "Reply to an image with .addpp",
  execute: async (sock, msg, args, quotedMessage) => {
    const remoteJid = msg.key.remoteJid;
    const media = quotedMessage?.imageMessage;
    if (!media) {
      await sock.sendMessage(remoteJid, {
        text: "Reply to an image with .addpp",
      });
      return;
    }
    const stream = await downloadContentFromMessage(media, "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    if (!remoteJid.endsWith("@g.us")) {
      const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      await sock.updateProfilePicture(user, buffer);
      await sock.sendMessage(remoteJid, {text: "Profile picture updated"});
      return;
    }
    await sock.updateProfilePicture(remoteJid, buffer);
    await sock.sendMessage(remoteJid, { text: "Profile picture updated" });
  },
};
