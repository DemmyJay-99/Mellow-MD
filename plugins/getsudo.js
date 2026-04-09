import sudo from  "../data/sudo.json" with { type: "json" };

export default {
   name: "getsudo",
   description: "Get sudo users",
   isPublic: false,
   category: "Sudo",
   execute: async (sock, msg, args) => {
      const remoteJid = msg.key.remoteJid;
      const sudoUsers = sudo.map((user) => `${user}`).join("\n");
      await sock.sendMessage(remoteJid, { text: `Sudo users are: ${sudoUsers}` });
   }
}