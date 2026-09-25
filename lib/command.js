import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import chokidar from "chokidar";
import { explicitLog } from "./log.js";
import { readdir } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.loadCommands();
    this.loadExternalPlugins();
  }
  getCommands() {
    return Array.from(this.commands.values());
  }
  async getPlugins() {
    const plugins = [];
    const files = await readdir("./plugins");
    for (const file of files) {
      if (file.endsWith(".js")) {
        const plugin = await import(`../plugins/${file}`);
        plugins.push(plugin.default);
      }
    }
    const efiles = await readdir("./plugins/eplugins");
    for (const efile of efiles) {
      if (efile.endsWith(".js")) {
        const plugin = await import(`../plugins/eplugins/${efile}`);
        plugins.push(plugin.default);
      }
    }
    return plugins;
  }
  async loadCommands() {
    const commandFiles = fs.readdirSync(path.join(__dirname, "../plugins")).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      try {
        const { default: command } = await import(`../plugins/${file}`);
        this.registerCommand(command, file);
      } catch (error) {
        console.error(`[SKIP] Failed to load plugin ${file}:`, error.message);
      }
    }
  }
  async loadExternalPlugins() {
    const dir = path.join(__dirname, "../plugins/eplugins");
    const commandFiles = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(".js")) : [];
    if (commandFiles.length === 0) return;
    for (const file of commandFiles) {
      try {
        const { default: command } = await import(`../plugins/eplugins/${file}`);
        explicitLog(`Installing ${command.name}`);
        this.registerCommand(command, file);
        explicitLog(`Installed ${command.name}`);
      } catch (error) {
        console.error(`[SKIP] Failed to load plugin ${file}:`, error.message);
      }
    }
  }
  getCommand(text) {
    const key = text.toLowerCase();
    if (this.commands.has(key)) return this.commands.get(key);
    const target = this.aliases.get(key);
    return target ? this.commands.get(target) : undefined;
  }
  async loadCommand(filePath) {
    const url = pathToFileURL(filePath);
    url.searchParams.set("v", Date.now());
    const file = path.basename(filePath);
    try {
      const { default: command } = await import(url.href);
      this.registerCommand(command, file);
      return command.name;
    } catch (err) {
      console.error(`[SKIP] Failed to load plugin ${file}:`, err.message);
    }
  }
  unloadCommand(name) {
    const nameLower = String(name).toLowerCase();
    if (!this.commands.has(nameLower)) {
      console.warn(`[SKIP] Command "${nameLower}" is not registered.`);
      return false;
    }
    this.commands.delete(nameLower);
    for (const [alias, target] of this.aliases) {
      if (target === nameLower) {
        this.aliases.delete(alias);
      }
    }
    return true;
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
  async watchPlugins() {
    const pluginPath = path.join(__dirname, "../plugins");
    const watcher = chokidar.watch(pluginPath, { ignoreInitial: true });
    watcher.on("add", async (file) => {
      if (file?.endsWith(".js"));
      explicitLog("New plugin detected, installing...");
      await this.loadCommand(file);
      explicitLog("Plugin installed");
    });
  }
  async init() {
    await this.loadCommands();
    return this;
  }
}

export const commandHandler = new CommandHandler();
