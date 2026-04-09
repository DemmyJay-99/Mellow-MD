export default {
  name: "rmpp",
  description: "Remove profile picture",
  isPublic: false,
  category: "Owner",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
      const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      console.log(user);
      await sock.removeProfilePicture(user);
      await sock.sendMessage(remoteJid, { text: "Profile picture removed"});
      return;
    }
    await sock.removeProfilePicture(remoteJid);
    await sock.sendMessage(remoteJid, { text: "Profile picture removed" });
  },
};
