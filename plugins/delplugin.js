import { commandHandler } from "../lib/command.js";
import path from "path";
import { fileURLToPath } from "url";
import { unlink } from "fs/promises";
import { explicitLog } from "../lib/log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "delplugin",
  description: "Uninstall external plugins",
  usage: "delplugin <plugin name>",
  category: "Bot",
  ownerOnly: true,

  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID } = mellow;
    const text = args[0]?.toLowerCase();

    if (!text) {
      return await sock.sendMessage(chatID, {
        text: "No plugin name provided",
      });
    }

    try {
      const plugin = commandHandler.getCommand(text);
      if (!plugin || !plugin.file) {
        explicitLog(`No command with this name: ${text}`);
        return await sock.sendMessage(chatID, {
          text: "External plugin not found",
        });
      }
      const { command, file } = plugin;
      const pluginFolder = path.join(__dirname, "eplugins");
      const filePath = path.join(pluginFolder, file);
      await unlink(filePath);
      const result = await commandHandler.unloadCommand(command.name);
      if (!result) {
        explicitLog(`Failed to unload ${text} after deleting file`);
        return await sock.sendMessage(chatID, {
          text: "Plugin file deleted, but command could not be unloaded",
        });
      }
      explicitLog(`Uninstalled ${text} plugin`);
      await sock.sendMessage(chatID, {
        text: `Plugin ${text} deleted`,
      });
    } catch (err) {
      console.error("Failed to remove plugin:", err.message);
      if (err.code === "ENOENT") {
        return await sock.sendMessage(chatID, {
          text: "Plugin file does not exist",
        });
      }
      await sock.sendMessage(chatID, {
        text: "Failed to delete plugin",
      });
    }
  },
};
