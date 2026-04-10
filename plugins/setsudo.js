import fs from "fs";
import isSudo from "../lib/isSudo.js";

export default {
  name: "setsudo",
  description: "Add sudo user",
  isPublic: false,
  category: "Sudo",
  Usage: "Reply to a user or mention one, or use `setsudo <number>`.",
  execute: async (sock, msg, args) => {
    const store = sock.signalRepository.lidMapping;
    const sudoPath = "./data/sudo.json";
    const sudoUsers = JSON.parse(fs.readFileSync(sudoPath));
    const remoteJid = msg.key.remoteJid;
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
        text: "Reply to a user or mention one, or use `setsudo <number>`.",
      });
      return;
    }

    if (targetJid.endsWith("@lid")) {
      const p = await store.getPNForLID(targetJid);
      targetJid = p.split(":")[0];
    } else if (targetJid.endsWith("@s.whatsapp.net")) {
      targetJid = targetJid.split("@")[0];
    }
    const botId = sock.user.id.split(":")[0];
    if (targetJid === botId) {
      await sock.sendMessage(remoteJid, {
        text: "You can't add bot as sudo.",
      });
      return;
    }

    if (await isSudo(targetJid)) {
      await sock.sendMessage(remoteJid, {
        text: "User is already sudo.",
      });
      return;
    }

    sudoUsers.push(targetJid);
    fs.writeFileSync(sudoPath, JSON.stringify(sudoUsers));
    await sock.sendMessage(remoteJid, { text: `${targetJid} is now sudo` });
  },
};
