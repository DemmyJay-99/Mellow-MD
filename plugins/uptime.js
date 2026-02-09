
export default{
    name: "uptime",
    description: "Check the bot's uptime",
    isPublic: false,
    execute: async (sock, msg, args) =>{
        const uptime = process.uptime();
    function formatSeconds(totalSeconds) {
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const parts = [];
        if (days > 0) parts.push(days + ' days');
        if (hours > 0) parts.push(hours + ' hours');
        if (minutes > 0) parts.push(minutes + ' minutes');
        if (seconds > 0 || parts.length === 0) parts.push(seconds + ' seconds'); // Always show seconds

        return parts.join(' ');
    }
    const formattedSeconds =  formatSeconds(uptime);
    await sock.sendMessage(msg.key.remoteJid, {text: `Your bot has been up for ${formattedSeconds}!`})
    }
}