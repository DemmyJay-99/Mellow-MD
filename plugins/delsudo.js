import { refreshSudoCache, loadSudoUsers} from "../lib/sudo.js";
import fs from "fs/promises";

export default {
  name: "delsudo",
  description: "Remove a user from sudo",
  category: "Sudo",
  usage: "Reply to a user or mention one.",
  ownerOnly: true,
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, ctxInfo } = mellow;
    const sudoPath = "./data/sudo.json";
    const sudoUsers = await loadSudoUsers();
    let targetJid;
    if (ctxInfo?.participant) {
      targetJid = ctxInfo.participant;
    } else if (ctxInfo?.mentionedJid?.length) {
      targetJid = ctxInfo.mentionedJid[0];
    } else {
      await sock.sendMessage(chatID, {
        text: "Reply to a user or mention one.",
      });
      return;
    }
    const index = sudoUsers.indexOf(targetJid);
    if (index === -1) {
      await sock.sendMessage(chatID, {
        text: "User is not sudo.",
      });
      return;
    }
    sudoUsers.splice(index, 1);
    await fs.writeFile(sudoPath, JSON.stringify(sudoUsers));
    await refreshSudoCache();
    await sock.sendMessage(chatID, { text: `${targetJid} is no longer sudo` });
  },
};
