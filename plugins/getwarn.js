import {getWarns} from "../lib/index.js";
import normaliseJidToPN from "../lib/normaliseJidToPN.js";

export default {
  name: "getwarn",
  description: "Get the number of warnings a user has",
  category: "Group",
  usage: ".getwarn @user",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup, senderID} = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const groupMetadata = await sock.groupMetadata(chatID);
    const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
    const sender = await normaliseJidToPN(sock, senderID);
    const isAdmin = groupAdmins.some((admin) => admin.id === sender);
    if (!isAdmin) {
      return sock.sendMessage(chatID, {text: "You are not an admin."});
    }
    let targetJid =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!targetJid) {
      return sock.sendMessage(remoteJid, {
        text: "Please mention or reply to a user to get their warnings.",
      });
    }
    targetJid = await normaliseJidToPN(sock, targetJid) + "@s.whatsapp.net";
    const warnCount = await getWarns(chatID, targetJid);
    if (!warnCount) {
      return sock.sendMessage(chatID, {text: `@${targetJid.split("@")[0]} has no warnings.`, mentions: [targetJid]});
    }
    return sock.sendMessage(chatID, {
      text: `Warning count for @${targetJid.split("@")[0]}: ${warnCount}`,
      mentions: [targetJid],
    });
  },
};
