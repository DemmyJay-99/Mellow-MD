import fs from "fs";
import {isSudo} from "../lib/sudo.js";
import normaliseJidToPN from "../lib/normaliseJidToPN.js";

export default {
  name: "setsudo",
  description: "Add sudo user",
  category: "Sudo",
  usage: "Reply to a user or mention one, or use `setsudo <number>`.",
  execute: async (sock, msg, args, mellow = {}) => {
    const {ctxInfo, chatID} = mellow;
    const sudoPath = "./data/sudo.json";
    const sudoUsers = JSON.parse(fs.readFileSync(sudoPath) || "[]");
    let targetJid;

    if (ctxInfo?.participant) {
      targetJid = ctxInfo.participant;
    } else if (ctxInfo?.mentionedJid?.length) {
      targetJid = ctxInfo.mentionedJid[0];
    } else if (args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num) {
        await sock.sendMessage(chatID, {
          text: "Provide a valid number.",
        });
        return;
      }
      targetJid = num;
    } else {
      await sock.sendMessage(chatID, {
        text: "Reply to a user or mention one, or use `setsudo <number>`.",
      });
      return;
    }

    targetJid = await normaliseJidToPN(sock, targetJid) + "@s.whatsapp.net";
    const botId = sock.user.id.split(":")[0];
    if (targetJid === botId) {
      await sock.sendMessage(chatID, {
        text: "You can't add bot as sudo.",
      });
      return;
    }

    if (await isSudo(targetJid)) {
      await sock.sendMessage(chatID, {
        text: "User is already sudo.",
      });
      return;
    }

    sudoUsers.push(targetJid);
    fs.writeFileSync(sudoPath, JSON.stringify(sudoUsers));
    await sock.sendMessage(chatID, {text: `${targetJid} is now sudo`});
  },
};
