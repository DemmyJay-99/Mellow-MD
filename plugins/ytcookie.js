import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "ytcookie",
  description: "Set yt cookie",
  usage: "Reply to a cookies.txt file",
  category: "Downloaders",
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessage, chatID } = mellow;
    const isCookieFile =
      quotedMessage && quotedMessage.documentMessage && quotedMessage.documentMessage.fileName === "cookies.txt";
    if (!isCookieFile) {
      return await sock.sendMessage(chatID, { text: 'Reply to your exported "cookies.txt" file' });
    }
    const stream = await downloadContentFromMessage(quotedMessage.documentMessage,"document")
    const filepath = path.join(__dirname,"../", "cookies.txt");
    await pipeline(stream, createWriteStream(filepath))
  },
};
