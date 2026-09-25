import { commandHandler } from "../lib/command.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { writeFile } from "fs/promises";
import { explicitLog } from "../lib/log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "plugin",
  description: "Install external plugins",
  usage: "plugin <url> or reply to url with plugin",
  category: "Bot",
  ownerOnly: true,
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, quotedMessageText } = mellow;
    const text = args[0] || quotedMessageText;
    if (!text) {
      return await sock.sendMessage(chatID, { text: "No URL provided" });
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(text);
    } catch (err) {
      console.log(err);
      return await sock.sendMessage(chatID, { text: "Invalid URL" });
    }
    const allowedHosts = ["gist.github.com"];
    if (!allowedHosts.includes(parsedUrl.host)) {
      return await sock.sendMessage(chatID, { text: "URL host not allowed." });
    }
    const gistId = parsedUrl.pathname.split("/").filter(Boolean).pop();
    const url = `https://api.github.com/gists/${gistId}`;
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub API failed: ${res.status}`);
      }
      const gist = await res.json();
      const files = Object.values(gist.files);

      const jsFiles = files.filter((file) => file.filename.endsWith(".js"));

      if (jsFiles.length === 0) {
        return await sock.sendMessage(chatID, {
          text: "No .js plugin found in the Gist.",
        });
      }
      const plugin = jsFiles[0];

      const pluginRes = await fetch(plugin.raw_url);

      if (!pluginRes.ok) {
        throw new Error(`Failed to download ${plugin.filename}`);
      }

      const body = await pluginRes.text();
      const pluginFolder = path.join(__dirname, "eplugins");
      const filePath = path.join(pluginFolder, plugin.filename);
      if (!fs.existsSync(pluginFolder)) {
        fs.mkdirSync(pluginFolder, { recursive: true });
      }
      await writeFile(filePath, body);
      await sock.sendMessage(chatID, { text: "Installing...." });
      explicitLog("Installing....");
      const command = await commandHandler.loadCommand(filePath);
      await sock.sendMessage(chatID, { text: `Installed ${command}` });
    } catch (err) {
      console.error("Error installing plugin:", err);
      await sock.sendMessage(chatID, { text: "Failed to install plugin" });
    }
  },
};
