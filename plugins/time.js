export default {
  name: "time",
  description: "Check the current time",
  isPublic: false,
  category: "Utility",
  usage: "time",
  execute: async (sock, msg, args) => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    await sock.sendMessage(msg.key.remoteJid, {text: `Time: ${time}`});
  },
};
