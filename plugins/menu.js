import { transform, getFonts } from "convert-unicode-fonts";
import config from "../config.js";
import p from "../package.json" with { type: "json" };
import { formatSeconds } from "../lib/uptime.js";
import { commandHandler } from "../lib/command.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import os from "os";
import { readFileSync } from "fs";

dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  name: "menu",
  description: "List all available commands",
  category: "General",
  usage: "menu",
  execute: async (sock, msg, args, mellow) => {
    const { chatID, pushname } = mellow;
    const cmds = commandHandler.getCommands() || [];
    if (cmds.length === 0) {
      await sock.sendMessage(chatID, { text: "No commands loaded." });
      return;
    }

    const grouped = {};
    for (const c of cmds) {
      const category = c.category || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(c);
    }

    const categoryOrder = ["General", "Utility", "Downloaders", "Fun", "Owner", "AI", "Group", "Uncategorized"];

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    const lines = [];

    for (const category of sortedCategories) {
      const cmdsInCategory = grouped[category];

      cmdsInCategory.sort((a, b) => a.name.localeCompare(b.name));

      lines.push(`┗━━━━━━━━━━━━━━`);
      lines.push(`┏━━〔 ${category.toUpperCase()} 〕 `);

      for (const c of cmdsInCategory) {
        const prefix = process.env.PREFIX ? process.env.PREFIX.split(",")[0] : config.prefix;
        lines.push(`┃  *${prefix[0]}${c.name}*`);
      }
    }

    const joinedText = lines.join("\n").toUpperCase();
    const fonts = getFonts();
    const day = dayjs().format("dddd");
    const time = dayjs()
      .tz(process.env.TIMEZONE || "UTC")
      .format("HH:mm:ss");
    const plugins = await commandHandler.getPlugins();
    const version = p.version;
    const uptime = process.uptime();
    const formattedSeconds = formatSeconds(uptime);
    const cores = os.cpus().length;
    const cpuModel = os.cpus()[0].model;
    const getAvailableMem = () => {
      try {
        const line = readFileSync("/proc/meminfo", "utf8")
          .split("\n")
          .find((l) => l.startsWith("MemAvailable:"));
        return parseInt(line.match(/\d+/)[0], 10) * 1024; // kB -> bytes
      } catch {
        return os.freemem(); // fallback for non-Linux
      }
    };
    const gb = (bytes) => (bytes / 1024 ** 3).toFixed(2);
    const totalMem = gb(os.totalmem());
    const availMem = getAvailableMem();
    const usedMem = gb(os.totalmem() - availMem);
    const botRamUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

    const text =
      "```┏━━━『 MELLOW MD 』━━━\n" +
      "┃★┏━━━━━━━━━━━━━━\n" +
      `┃★┃Prefix: ${process.env.PREFIX || config.prefix}\n` +
      `┃★┃User: ${pushname || "Unknown"}\n` +
      `┃★┃Time: ${time}\n` +
      `┃★┃Day: ${day}\n` +
      `┃★┃Plugins: ${plugins.length}\n` +
      `┃★┃Version: ${version}\n` +
      `┃★┃Uptime: ${formattedSeconds}\n` +
      `┃★┃CPU: ${cpuModel} (${cores} cores)\n` +
      `┃★┃System RAM: ${usedMem} GB / ${totalMem} GB\n` +
      `┃★┃Bot RAM: ${botRamUsed} MB\n` +
      "┃★┗━━━━━━━━━━━━━━```\n" +
      `${joinedText}\n` +
      `┗━━━━━━━━━━━━━━`;

    const styledText = transform(text, fonts["monospace"]);

    await sock.sendMessage(chatID, { text: styledText });
  },
};
