import fs from "fs";

export default {
  name: "getsudo",
  description: "Get sudo users",
  isPublic: false,
  category: "Sudo",
  usage: "getsudo",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    const sudo = JSON.parse(fs.readFileSync("./data/sudo.json"));
    const sudoUsers = sudo.map((user) => `${user}`).join("\n");
    await sock.sendMessage(remoteJid, {text: `Sudo users are: ${sudoUsers}`});
  },
};
