export default {
    name: "zushi",
    description: "",
    isPublic: false,
    async execute(sock, msg, args) {
        const { getCommands } = await import("../lib/commandHandler.js");
        const commands = getCommands();

        if (!args || args.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, {text: "Add a command as an argument"})
            return;
        }

        const target = args[0].toLowerCase().replace(/^\./, "");
        const cmd = commands.find(c => c.name && c.name.toLowerCase() === target);

        if (!cmd) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ Command not found: ${target}` });
            return;
        }

        if(cmd.isPublic === false){
            cmd.isPublic = true;
            await sock.sendMessage(msg.key.remoteJid, {text: `Set *${cmd.name.toUpperCase()}* to public!`});
        } else{
            await sock.sendMessage(msg.key.remoteJid, {text: 'Command is already public'})
        }
    }
}