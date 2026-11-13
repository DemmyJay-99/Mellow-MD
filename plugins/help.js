import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {commandHandler} from "../lib/command.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  name: "help",
  description: "Get help for commands",
  category: "General",
  usage: "help to get a list of all commands, or help <command> to get help for a specific command",
  execute: async (sock, msg, args, mellow) => {
    const { chatID } = mellow;
    const plugins = await commandHandler.getPlugins();
    
    if (args[0]) {
      const query = args[0].toLowerCase();
      const command = plugins.find((p) => p.name.toLowerCase() === query || (p.aliases && p.aliases.includes(query)));
      if (!command) {
        await sock.sendMessage(chatID, {
          text: `Command ${query} not found`,
        });
        return;
      }
      const commandName = command.name.charAt(0).toUpperCase() + command.name.slice(1);
      const description = command.description || "No description available";
      const category = command.category || "No category available";
      const usage = command.usage || "No usage available";
      const aliases = command.aliases ? command.aliases.join(", ") : "No aliases available";

      let helpText = `*${commandName}* \n\n`;
      helpText += `*Description:* ${description}\n`;
      helpText += `*Category:* ${category}\n`;
      helpText += `*Usage:* ${usage}\n`;
      helpText += `*Aliases:* ${aliases}\n`;
      return await sock.sendMessage(chatID, { text: helpText });
    }

    let helpText = "Available commands:\n\n";
    for (const command of plugins) {
      helpText += `*${command.name}* - ${command.description}\n`;
    }
    await sock.sendMessage(chatID, { text: helpText });
  },
};
