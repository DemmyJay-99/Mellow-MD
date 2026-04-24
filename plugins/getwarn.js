import { getWarns } from '../lib/index.js';
import normaliseLid from '../lib/normaliseLid.js'

export default {
    name: "getwarns",
    description: "Get the number of warnings a user has",
    isPublic: false,
    category: "Group",
    usage: ".getwarns @user",
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
         const pn = await normaliseLid(sock, sender);
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
         const pn = await normaliseLid(sock, targetJid);
         targetJid = pn + "@s.whatsapp.net";
      }
      const warnCount = await getWarns(remoteJid, targetJid);
      if(!warnCount){
         return sock.sendMessage(remoteJid, { text: `@${targetJid.split('@')[0]} has no warnings.`, mentions: [targetJid] });
      }
      return sock.sendMessage(remoteJid, { text: `Warning count for @${targetJid.split('@')[0]}: ${warnCount}`, mentions: [targetJid] });
    }
}