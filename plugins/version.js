import p from "../package.json" with {type: "json"};

const version = p.version;
export default {
  name: "version",
  description: "Check the bot's current version",
  category: "Bot",
  usage: "version",
  execute: async (sock, msg, args) => {
    await sock.sendMessage(msg.key.remoteJid, {text: `Mellow MD Version: ${version}`});
  },
};
