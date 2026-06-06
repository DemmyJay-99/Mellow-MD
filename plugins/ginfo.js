import normaliseJidToPN from "../lib/normaliseJidToPN.js";
import normaliseLid from "../lib/normaliseLid.js";

export default {
  name: "ginfo",
  description: "Get group info",
  category: "Group",
  usage: "ginfo",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup} = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const metadata = await sock.groupMetadata(chatID);
    const groupName = metadata.subject;
    const groupDesc = metadata.desc;
    const groupMembers = metadata.participants.length;
    const groupAdminJids = metadata.participants.filter((p) => p.admin || p.admin === "superadmin").map((p) => p.id);
    const mentionText = groupAdminJids.map((jid) => "@" + jid.split("@")[0]).join(",");
    const groupCreated = new Date(metadata.creation * 1000).toLocaleString();
    let groupOwner = metadata.owner || "Unknown";
    groupOwner = await normaliseJidToPN(sock, groupOwner) + "@s.whatsapp.net";

    const groupPP = await sock.profilePictureUrl(chatID, "image");
    const groupInfo = `*Name:* ${groupName}\n*Description:* ${groupDesc}\n*Members:* ${groupMembers}\n*Admins:*${mentionText}\n*Created:* ${groupCreated}\n*Owner:* @${groupOwner.split("@")[0]}`;
    if (groupPP) {
      await sock.sendMessage(chatID, {
        image: {url: groupPP},
        caption: groupInfo,
        mentions: [...groupAdminJids, groupOwner],
      });
    } else {
      await sock.sendMessage(chatID, {text: groupInfo});
    }
  },
};
