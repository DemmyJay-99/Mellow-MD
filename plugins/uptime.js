export default {
  name: "uptime",
  description: "Check the bot's uptime",
  isPublic: false,
  category: "Utility",
  usage: "uptime",
  execute: async (sock, msg, args) => {
    const uptime = process.uptime();
    function formatSeconds(totalSeconds) {
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      const parts = [];
      if (days > 0) parts.push(days + " days");
      else if (days === 1) parts.push(days + " day");
      if (hours > 0) parts.push(hours + " hours")
        else if (hours === 1) parts.push(hours + " hour");
      if (minutes > 0) parts.push(minutes + " minutes")
        else if (minutes === 1) parts.push(minutes + " minute");
      if (seconds > 0 || parts.length === 0) parts.push(seconds + " seconds")
        else if (seconds === 1) parts.push(seconds + " second");

      return parts.join(" ");
    }
    const formattedSeconds = formatSeconds(uptime);
    await sock.sendMessage(msg.key.remoteJid, {text: `Your bot has been up for ${formattedSeconds}!`});
  },
};
