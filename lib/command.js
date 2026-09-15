import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.loadCommands()
  }
  getCommands() {
    return Array.from(this.commands.values());
  }
  async loadCommands() {
    const commandFiles = fs.readdirSync(path.join(__dirname, "../plugins")).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      try {
        const { default: command } = await import(`../plugins/${file}`);
        this.registerCommand(command, file);
      } catch (error) {
        console.error(`[SKIP] Failed to load plugin ${file}:`, err.message);
      }
    }
  }
  getCommand(text) {
    const key = text.toLowerCase();
    if (this.commands.has(key)) return this.commands.get(key);
    const target = this.aliases.get(key);
    return target ? this.commands.get(target) : undefined;
  }
  registerCommand(command, file) {
    const { name, execute, aliases = [] } = command;
    if (!name || typeof execute !== "function") {
      console.error(`[SKIP] Plugin at ${name || "unknown"} is missing a valid command name or handler function.`);
      return;
    }
    const nameLower = name.toLowerCase();
    const aliasKeys = aliases.map((a) => String(a).toLowerCase());
    if (this.commands.has(nameLower)) {
      console.warn(
        `[REPLACE] Command "${nameLower}" is already registered. Replacing with new version from ${file || "unknown"}.`,
      );
    }
    this.commands.set(nameLower, command);
    for (const alias of aliasKeys) {
      if (this.commands.has(alias)) {
        console.warn(`[SKIP] Alias "${alias}" conflicts with an existing command name.`);
        continue;
      }
      this.aliases.set(alias, nameLower);
    }
  }
  async init() {
    await this.loadCommands();
    return this;
  }
}

export const commandHandler = new CommandHandler();
