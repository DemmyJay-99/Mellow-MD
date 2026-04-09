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
    execute: async (sock, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const commands = new Map();
        const commandFiles = fs
            .readdirSync(path.join(__dirname, "../plugins"))
            .filter((file) => file.endsWith(".js"))
        for(const file of commandFiles) {
            const { default: command } = await import(`../plugins/${file}`);
            commands.set(command.name, command.description)
        }
      let helpText = "Available commands:\n\n";
      for(const [name, description] of commands) {
        helpText += `*${name}* - ${description}\n`
      }
      await sock.sendMessage(remoteJid, { text: helpText })
    }
}