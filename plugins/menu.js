import fs from 'fs';
import path from 'path';
import { json } from 'stream/consumers';
import { fileURLToPath } from 'url';
import { transform, getFonts } from "convert-unicode-fonts";
import { getCommands } from "../lib/commandHandler.js";
import config from '../config.js';

export default {
  name: "menu",
  description: "List all available commands",
  isPublic: false,
  category: "General",
  execute: async (sock, msg, args) => {
    const cmds = getCommands() || [];
    if (cmds.length === 0) {
      await sock.sendMessage(msg.key.remoteJid, { text: "No commands loaded." });
      return;
    }

    const grouped = {};
    for (const c of cmds) {
      const category = c.category || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(c);
    }

    const categoryOrder = [
      "General",
      "Utility",
      "Downloaders",
      "Fun",
      "Owner",
      "AI",
      "Uncategorized"
    ];

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

      lines.push(`╰─────────────────`);
      lines.push(`╭─ ❏ ${category.toUpperCase()} ❏ `);

      for (const c of cmdsInCategory) {
        lines.push(` |  *${config.prefix}${c.name}*`);
      }
    }

    const joinedText = lines.join("\n").toUpperCase();
    const fonts = getFonts();
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const date = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];

    const text =
      "```╭═══ MELLOW MD ═══⊷\n" +
      "┃❃╭──────────────\n" +
      `┃❃│Prefix: ${config.prefix}\n` +
      `┃❃│User: ${config.OwnerName}\n` +
      `┃❃│Time: ${hour}:${minute}\n` +
      `┃❃│Day: ${day}\n` +
      `┃❃│Platform: ${process.env.PLATFORM}\n` +
      "┃❃╰───────────────\n" +
      "╰═════════════════⊷```\n" +
      `${joinedText}\n` +
      `╰───────────────`;

    const styledText = transform(text, fonts["bold"]);

    await sock.sendMessage(msg.key.remoteJid, { text: styledText });
  }
};