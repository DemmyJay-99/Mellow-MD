import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
    name: "help",
    description: "Get help for commands",
    isPublic: false,
    category: "Bot",
    Usage: "help to get a list of all commands, or help <command> to get help for a specific command",
    execute: async (sock, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const commands = new Map();
        const commandFiles = fs
            .readdirSync(path.join(__dirname, "../plugins"))
            .filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const { default: command } = await import(`../plugins/${file}`);
            commands.set(command.name, command);
        }

        if (args[0]) {
            const query = args[0].toLowerCase();
            const command = commands.get(query);
            if (!command) {
                await sock.sendMessage(remoteJid, {
                    text: `Command ${query} not found`,
                });
                return
            }
            const commandName = command.name.charAt(0).toUpperCase() + command.name.slice(1);
            const description = command.description || "No description available";
            const category = command.category || "No category available";
            const usage = command.usage || "No usage available";
            
            let helpText = `*${commandName}* \n\n`;
            helpText += `*Description:* ${description}\n`;
            helpText += `*Category:* ${category}\n`;
            helpText += `*Usage:* ${usage}\n`;
            return await sock.sendMessage(remoteJid, { text: helpText });
        }

        let helpText = "Available commands:\n\n";
        for (const [name, command] of commands) {
            helpText += `*${name}* - ${command.description}\n`;
        }
        await sock.sendMessage(remoteJid, { text: helpText });
    },
};
