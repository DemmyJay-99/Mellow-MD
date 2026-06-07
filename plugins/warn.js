import {getWarns, setWarns} from "../lib/index.js";
import normaliseJidToPN from "../lib/normaliseJidToPN.js";
const WARN_LIMIT = Number(process.env.WARN_LIMIT) || 3;

export default {
  name: "warn",
  description: "Warn a user",
  category: "Group",
  usage: "warn <@user>",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, chatIDisGroup, senderID, ctxInfo} = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const groupMetadata = await sock.groupMetadata(chatID);
    const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
   const sender = await normaliseJidToPN(sock, senderID) + "@s.whatsapp.net";
    const isAdmin = groupAdmins.some((admin) => admin.id === sender);
    if (!isAdmin) {
      return sock.sendMessage(chatID, {text: "You are not an admin."});
    }
    let targetJid =
      ctxInfo?.participant ||
      ctxInfo?.mentionedJid?.[0];
    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Please mention a user to warn.",
      });
    }
   targetJid = await normaliseJidToPN(sock, targetJid) + "@s.whatsapp.net";
    const warnCount = await getWarns(chatID, targetJid);
    if (warnCount + 1 >= WARN_LIMIT) {
      await sock.groupParticipantsUpdate(chatID, [targetJid], "remove");
      await sock.sendMessage(chatID, {
        text: `@${targetJid.split("@")[0]} has been kicked for too many warnings.`,
        mentions: [targetJid],
      });
      await setWarns(chatID, targetJid, 0);
      return;
    } else {
      const newWarnCount = warnCount + 1;
      await setWarns(chatID, targetJid, newWarnCount);
      await sock.sendMessage(chatID, {
        text: `@${targetJid.split("@")[0]} has been warned. Warn count: ${newWarnCount}`,
        mentions: [targetJid],
      });
    }
  },
};
