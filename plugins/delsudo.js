import normalizeJid from "../lib/normaliseLid.js";
import fs from "fs";

export default {
   name: "delsudo",
   description: "Remove a user from sudo",
   isPublic: false,
   category: "Sudo",
   Usage: "Reply to a user or mention one, or use `.delsudo <number>`.",
   execute: async (sock, msg, args) => {
      const remoteJid = msg.key.remoteJid;
      const sudoPath = "./data/sudo.json";
      const sudoUsers = JSON.parse(fs.readFileSync(sudoPath));
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      let targetJid;
      if (ctxInfo?.participant) {
         targetJid = ctxInfo.participant;
      } else if (ctxInfo?.mentionedJid?.length) {
         targetJid = ctxInfo.mentionedJid[0];
      } else if (args[0]) {
         const num = args[0].replace(/\D/g, "");
         if (!num) {
            await sock.sendMessage(remoteJid, {
               text: "Provide a valid number.",
            });
            return;
         }
         targetJid = num;
      } else {
         await sock.sendMessage(remoteJid, {
            text: "Reply to a user or mention one, or use `.delsudo <number>`.",
         });
         return;
      }
      if (targetJid.endsWith("@lid")) {
         const pn = await normalizeJid(sock, targetJid);
         targetJid = pn;
      }
      const index = sudoUsers.indexOf(targetJid);
      if (index === -1) {
         await sock.sendMessage(remoteJid, {
            text: "User is not sudo.",
         });
         return;
      }
      sudoUsers.splice(index, 1);
      fs.writeFileSync(sudoPath, JSON.stringify(sudoUsers));
      await sock.sendMessage(remoteJid, {
         text: `${targetJid} is no longer sudo`,
      });
   },
};
