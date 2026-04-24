import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config.js";
import dotenv from "dotenv";
import isSudo from "../lib/isSudo.js";
import isEmoji from "is-emoji";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "config.env") });

const commands = new Map();
export async function loadCommands() {
    const commandFiles = fs
        .readdirSync(path.join(__dirname, "../plugins"))
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const { default: command } = await import(`../plugins/${file}`);
        if (typeof command.isPublic !== "boolean") command.isPublic = false;
        commands.set(command.name, command);
    }
    console.log(`loaded ${commands.size} commands`);

    return commands.size;
}

(async () => {
    await loadCommands();
})();

export function getCommands() {
    return Array.from(commands.values());
}
export default async function handleCommand(sock, msg) {
    try {
        const prefix = process.env.PREFIX || config.prefix;
        const contentInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = contentInfo?.quotedMessage;
        const store = sock.signalRepository.lidMapping;
        const body =
            msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        for (const cmd of commands.values()) {
            if (typeof cmd.onMessage === "function") {
                try {
                    await cmd.onMessage(sock, msg, body, quotedMessage);
                } catch (err) {
                    console.error(
                        `Error in onMessage for command ${cmd.name}:`,
                        err,
                    );
                }
            }
        }
        if (!body || !body.startsWith(prefix)) return;
        const args = body.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        const rawSender = msg.key.participant || msg.key.remoteJid;
        let pn;
        if (rawSender.endsWith("@lid")) {
            const p = await store.getPNForLID(rawSender);
            pn = p.split(":")[0];
        } else {
            pn = rawSender.split("@")[0];
        }
        const sender = pn;
        const isSudoUser = await isSudo(sender);
        const isAllowed = msg.key.fromMe || isSudoUser || command.isPublic;
        if (!isAllowed) return;
        const emojiValue = process.env.REACT_EMOJI || config.reactEmoji;
        let reactEmoji = emojiValue.charAt(0) || "✅";
        if (!isEmoji(reactEmoji)) {
            reactEmoji = "✅";
        }
        await sock.sendMessage(msg.key.remoteJid, {
            react: {
                text: `${reactEmoji}`,
                key: msg.key,
            },
        });
        await command.execute(sock, msg, args, quotedMessage);
        async function removeReaction() {
            await sock.sendMessage(msg.key.remoteJid, {
                react: {
                    text: "",
                    key: msg.key,
                },
            });
        }
        setTimeout(removeReaction, 1000);
    } catch (err) {
        console.error("Error handling command:", err);
        await sock.sendMessage(msg.key.remoteJid, {
            text: "Command error--:" + err.stack,
        });
    }
}
