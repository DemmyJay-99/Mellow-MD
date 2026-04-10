export default {
    name: "gclabel",
    description: "Set a label for a group",
    isPublic: false,
    category: "Group",
    Usage: "gclabel <label>",
    execute: async (sock, msg, args) => {
      const remoteJid = msg.key.remoteJid;
      if(!remoteJid.endsWith('@g.us')) {
         await sock.sendMessage(msg.key.remoteJid, {text: "This command can only be used in groups"})
      }
      const metadata = await sock.groupMetadata(remoteJid);
      const groupName = metadata.subject;
      const label = args.join(" ");
      if (!label) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Please provide a label" });
        return;
      }
      await sock.updateMemberLabel(remoteJid, label);
      await sock.sendMessage(msg.key.remoteJid, { text: `Member label for ${groupName} set to ${label}` });
    }
}