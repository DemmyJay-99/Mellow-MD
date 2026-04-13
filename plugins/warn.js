import { getWarns, setWarns } from "../lib/index.js";
import normalizeJid from "../lib/normaliseLid.js";
const WARN_LIMIT = Number(process.env.WARN_LIMIT) || 3;

export default {
   name: "warn",
   description: "Warn a user",
   isPublic: false,
   category: "Group",
   usage: "warn <@user>",
   execute: async (sock, msg, args) => {
      const remoteJid = msg.key.remoteJid;
      if (!remoteJid.endsWith("@g.us")) {
         return sock.sendMessage(remoteJid, {
            text: "This command only works in groups.",
         });
      }
      const groupMetadata = await sock.groupMetadata(remoteJid);
      const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
      let sender = msg.key.participant || msg.key.remoteJid;
      if (sender.endsWith("@lid")) {
         const pn = await normalizeJid(sock, sender);
         sender = pn + "@s.whatsapp.net";
      }
      const isAdmin = groupAdmins.some((admin) => admin.id === sender);
      if (!isAdmin) {
         return sock.sendMessage(remoteJid, { text: "You are not an admin." });
      }
      let targetJid =
         msg.message?.extendedTextMessage?.contextInfo?.participant ||
         msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!targetJid) {
         return sock.sendMessage(remoteJid, {
            text: "Please mention a user to warn.",
         });
      }
      if(targetJid.endsWith('@lid')){
         const pn = await normalizeJid(sock, targetJid);
         targetJid = pn + "@s.whatsapp.net";
      }
      const warnCount = await getWarns(remoteJid, targetJid);
      if (warnCount + 1 >= WARN_LIMIT) {
         await sock.groupParticipantsUpdate(
            remoteJid,
            [targetJid],
            "remove",
         );
         await sock.sendMessage(remoteJid, {
            text: `@${targetJid.split("@")[0]} has been kicked for too many warnings.`,
            mentions: [targetJid],
         });
         await setWarns(remoteJid, targetJid, 0);
         return;
      } else {
         const newWarnCount = warnCount + 1;
         await setWarns(remoteJid, targetJid, newWarnCount);
         await sock.sendMessage(remoteJid, {
            text: `@${targetJid.split("@")[0]} has been warned. Warn count: ${newWarnCount}`,
            mentions: [targetJid],
         });
      }
   },
};
