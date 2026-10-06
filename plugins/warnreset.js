import normaliseJidToPN from "../lib/normaliseJidToPN.js";
import { isSenderAdmin, setWarns } from "../lib/index.js";

export default {
  name: "warnreset",
  description: "Reset warn count for a group member",
  category: "Group",
  usage: "Reply to a member or mention them",
  aliases: ["wr"],
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup, senderID, ctxInfo } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const isAdmin = isSenderAdmin(sock, senderID, chatID);
    if (!isAdmin) {
      return sock.sendMessage(chatID, { text: "You are not an admin." });
    }
    let targetJid = ctxInfo?.participant || ctxInfo?.mentionedJid?.[0];
    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Please mention a user or reply to their message to reset their warn count.",
      });
    }
    targetJid = (await normaliseJidToPN(sock, targetJid)) + "@s.whatsapp.net";
    await setWarns(chatID, targetJid, 0);
    await sock.sendMessage(chatID, {
      text: `@${targetJid.split("@")[0]} has had their warn count reset.`,
      mentions: [targetJid],
    });
  },
};
