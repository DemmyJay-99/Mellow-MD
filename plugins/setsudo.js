import fs from "fs/promises";
import { isSudo, refreshSudoCache, loadSudoUsers } from "../lib/sudo.js";

export default {
  name: "setsudo",
  description: "Add sudo user",
  category: "Sudo",
  usage: "Reply to a user or mention one, or use `setsudo <number>`.",
  aliases: ["addsudo", "sudoadd", "addsudouser", "asudo"],
  ownerOnly: true,
  execute: async (sock, msg, args, mellow = {}) => {
    const { ctxInfo, chatID, botID } = mellow;
    const sudoPath = "./data/sudo.json";
    const sudoUsers = await loadSudoUsers();
    let targetJid;

    if (ctxInfo?.participant) {
      targetJid = ctxInfo.participant;
    } else if (ctxInfo?.mentionedJid?.length) {
      targetJid = ctxInfo.mentionedJid[0];
    } else {
      await sock.sendMessage(chatID, {
        text: "Reply to a user or mention one, or use `setsudo <number>`.",
      });
      return;
    }
    if (targetJid === botID) {
      await sock.sendMessage(chatID, {
        text: "You can't add bot as sudo.",
      });
      return;
    }

    if (isSudo(targetJid)) {
      await sock.sendMessage(chatID, {
        text: "User is already sudo.",
      });
      return;
    }

    sudoUsers.push(targetJid);
    await fs.writeFile(sudoPath, JSON.stringify(sudoUsers));
    await refreshSudoCache();
    await sock.sendMessage(chatID, { text: `${targetJid} is now sudo` });
  },
};
