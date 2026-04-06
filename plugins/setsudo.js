import fs from "fs";
import isSudo from "../lib/isSudo.js"

const sudoPath = "./data/sudo.json";

if (!fs.existsSync(sudoPath)) {
  const dir = "./data";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(sudoPath, JSON.stringify([]));
}

const sudoUsers = JSON.parse(fs.readFileSync(sudoPath));

export default {
  name: "setsudo",
  description: "Add sudo user",
  isPublic: false,
  category: "Owner",
  execute: async (sock, msg, args) => {
    const store = sock.signalRepository.lidMapping;
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
      targetJid = num + "@s.whatsapp.net";
    } else {
      await sock.sendMessage(remoteJid, {
        text: "Reply to a user or mention one, or use `.setsudo <number>`.",
      });
      return;
    }

    if (targetJid.endsWith("@lid")) {
      const p = await store.getPNForLID(targetJid);
      targetJid = p.split(":")[0];
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
