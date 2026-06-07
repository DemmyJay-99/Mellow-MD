import fs from "fs";

export default {
  name: "getsudo",
  description: "Get sudo users",
  category: "Sudo",
  usage: "getsudo",
  execute: async (sock, msg, args) => {
    const chatID = msg.key.remoteJid;
    const sudo = JSON.parse(fs.readFileSync("./data/sudo.json") || "[]");
    const sudoUsers = sudo.map((user) => `${user}`).join("\n");
    await sock.sendMessage(chatID, {text: `Sudo users are: ${sudoUsers}`});
  },
};
