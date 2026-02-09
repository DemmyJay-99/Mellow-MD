export default {
    name: "ope",
    description: "",
    isPublic: false,
    async execute(sock, msg, args) {
        const { getCommands } = await import("../../commandHandler.js");
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
        if(cmd.isPublic === true){
            cmd.isPublic = false;
            await sock.sendMessage(msg.key.remoteJid, {text: `Set ${cmd.name.toUpperCase()} to private!`});
        } else{
            await sock.sendMessage(msg.key.remoteJid, {text: 'Command is already private'})
        }
    }
}