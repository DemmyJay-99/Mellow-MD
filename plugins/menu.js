import fs from 'fs';
import path from 'path';
import { json } from 'stream/consumers';
import { fileURLToPath } from 'url';
import { transform, getFonts } from "convert-unicode-fonts";
import { getCommands } from "../lib/commandHandler.js";
import config from '../config.js';

export default{
    name: "menu",
    description: "List all available commands",
    isPublic: false,
    execute: async(sock, msg, args) => {
        const cmds = getCommands() || [];
        if (cmds.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: "No commands loaded." });
            return;
        }

        // Wrap the command in * for WhatsApp bold, keep spaces intact
        const lines = cmds.map(c => {
            const desc = c.description ? c.description : "No description";
            return `├─ *${config.prefix}${c.name}*`;
        });

        const joinedText = lines.join("\n").toUpperCase();
        const fonts = getFonts();
        const text = `Hello ,` + `*${config.OwnerName}*\n` +
                        `*PREFIX: ${config.prefix}*\n\n\n` +
                        `╭─「 🤖 BOT MENU 」\n` + 
                        `│\n`+
                        `│\n`+
                        `${joinedText}\n` +
                        `│\n` +
                        `╰───────────────`;
        const styledText = transform(text, fonts['fullWidth'])

        await sock.sendMessage(msg.key.remoteJid, { text: styledText });
    }
}