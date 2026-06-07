import {transform, getFonts} from "convert-unicode-fonts";
import config from "../config.js";
import getPlugins from "../lib/getPlugins.js";
import p from "../package.json" with {type: "json"};
import {formatSeconds} from "../lib/uptime.js";
import { commandHandler } from "../lib/command.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  name: "menu",
  description: "List all available commands",
  category: "General",
  usage: "menu",
  execute: async (sock, msg, args) => {
    const cmds = commandHandler.getCommands() || [];
    if (cmds.length === 0) {
      await sock.sendMessage(msg.key.remoteJid, {text: "No commands loaded."});
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
    const time = dayjs().tz(process.env.TIMEZONE || "UTC").format("HH:mm:ss");
    const plugins = await getPlugins();
    const version = p.version;
    const uptime = process.uptime();
    const formattedSeconds = formatSeconds(uptime);
    const text =
      "```┏━━━『 MELLOW MD 』━━━\n" +
      "┃★┏━━━━━━━━━━━━━━\n" +
      `┃★┃Prefix: ${process.env.PREFIX || config.prefix}\n` +
      `┃★┃User: ${process.env.OWNER_NAME || config.OwnerName}\n` +
      `┃★┃Time: ${time}\n` +
      `┃★┃Day: ${day}\n` +
      `┃★┃Platform: ${process.env.PLATFORM}\n` +
      `┃★┃Plugins: ${plugins.length}\n` +
      `┃★┃Version: ${version}\n` +
      `┃★┃Uptime: ${formattedSeconds}\n` +
      "┃★┗━━━━━━━━━━━━━━```\n" +
      `${joinedText}\n` +
      `┗━━━━━━━━━━━━━━`;

    const styledText = transform(text, fonts["bold"]);

    await sock.sendMessage(msg.key.remoteJid, {text: styledText});
  },
};
