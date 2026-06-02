import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import config from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.loadCommands();
  }
  getCommands() {
    return Array.from(this.commands.values());
  }
  async loadCommands() {
    const commandFiles = fs.readdirSync(path.join(__dirname, "../plugins")).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const {default: command} = await import(`../plugins/${file}`);
      this.registerCommand(command);
    }
  }
  getCommand(text) {
    const prefix = process.env.PREFIX ? process.env.PREFIX.split(",") : config.prefix;
    const usedPrefix = prefix.find((p) => text.startsWith(p));
    if (!usedPrefix) return null;
    const firstWord = text.slice(usedPrefix.length).trim().split(" ")[0];
    return this.commands.get(firstWord.toLowerCase());
  }
  registerCommand(command) {
    const {name, execute} = command;
    if (!name || typeof execute !== "function") {
      console.error(`[SKIP] Plugin at ${name || "unknown"} is missing a valid command name or handler function.`);
      return;
    }
    const nameLower = name.toLowerCase();
    if (this.commands.has(nameLower)) {
      console.warn(
        `[REPLACE] Command "${nameLower}" is already registered. Replacing with new version from ${command || "unknown"}.`,
      );
    }
    this.commands.set(nameLower, command);
  }
}

export const commandHandler = new CommandHandler();