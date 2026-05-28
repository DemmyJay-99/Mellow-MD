import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config.js";
import isSudo from "../lib/isSudo.js";
import isEmoji from "is-emoji";
import { isEnabled } from "../lib/perm.js";
import normaliseJidToPN from "./normaliseJidToPN.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = new Map();
export async function loadCommands() {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, "../plugins"))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const { default: command } = await import(`../plugins/${file}`);
    commands.set(command.name, command);
  }
  console.log(`Loaded ${commands.size} plugins`);
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
    const body =
      msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    for (const cmd of commands.values()) {
      if (typeof cmd.onMessage === "function") {
        try {
          await cmd.onMessage(sock, msg, body, quotedMessage);
        } catch (err) {
          console.error(`Error in onMessage for command ${cmd.name}:`, err);
        }
      }
    }
    if (!body || !body.startsWith(prefix)) return;
    const args = body.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    const senderID = msg.key.participant || msg.key.remoteJid;
    const pn = await normaliseJidToPN(sock, senderID);
    if (!pn) {
      console.error(`Could not normalise JID to PN for sender: ${senderID}`);
      return;
    }
    const isSudoUser = await isSudo(pn);
    const isGroup = msg.key.remoteJid.endsWith("@g.us");
    const isFromMe = msg.key.fromMe;
    if (isFromMe) {
    } else if (isSudoUser) {
    } else if (isGroup && isEnabled(msg.key.remoteJid, commandName)) {
    } else {
      return;
    }
    const emojiValue = process.env.REACT_EMOJI || config.reactEmoji || "";

    let reactEmoji = Array.from(emojiValue)[0] || null;

    if (!reactEmoji || !isEmoji(reactEmoji)) {
      reactEmoji = "✅";
    }

    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: reactEmoji,
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
    const error = err.stack + "\n";
    const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    await sock.sendCodeBlock(user, error, null, {
      title: "Command Error \n",
      language: "javascript",
      footer: "Report issues to t.me/mellowmd",
    });
  }
}
