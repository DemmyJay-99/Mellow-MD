import normaliseLid from "../lib/normaliseLid.js";

export default {
  name: "ginfo",
  description: "Get group info",
  isPublic: false,
  category: "Group",
  usage: "ginfo",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(remoteJid, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(remoteJid);
    const groupName = metadata.subject;
    const groupDesc = metadata.desc;
    const groupMembers = metadata.participants.length;
    const groupAdminJids = metadata.participants.filter((p) => p.admin || p.admin === "superadmin").map((p) => p.id);
    const mentionText = groupAdminJids.map((jid) => "@" + jid.split("@")[0]).join(",");
    const groupCreated = new Date(metadata.creation * 1000).toLocaleString();
    let groupOwner = metadata.owner || "Unknown";
    if (groupOwner.endsWith("@lid")) {
      const pn = await normaliseLid(sock, groupOwner);
      groupOwner = pn + "@s.whatsapp.net";
    }

    const groupPP = await sock.profilePictureUrl(remoteJid, "image");
    const groupInfo = `*Name:* ${groupName}\n*Description:* ${groupDesc}\n*Members:* ${groupMembers}\n*Admins:*${mentionText}\n*Created:* ${groupCreated}\n*Owner:* @${groupOwner.split("@")[0]}`;
    if (groupPP) {
      await sock.sendMessage(remoteJid, {
        image: {url: groupPP},
        caption: groupInfo,
        mentions: [...groupAdminJids, groupOwner],
      });
    } else {
      await sock.sendMessage(remoteJid, {text: groupInfo});
    }
  },
};
