import { readData, writeData, isJid } from "../lib/index.js";
import { getMessage } from "../lib/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleMessageRevocation = async (sock, message) => {
  try {
    const antideleteConfig = await readData(path.join(__dirname, "../data/antidelete.json"));
    const action = antideleteConfig[0];
    if (!action || action === "off") {
      return;
    }
    const msgID = message.message.protocolMessage.key.id;
    console.log(`Message with ID ${msgID} has been revoked.`);
    const original = await getMessage(msgID);
    if (!original) {
      console.log(`Original message with ID ${msgID} not found in the database.`);
      return;
    }
    const content =
      original?.message?.conversation ||
      original?.message?.extendedTextMessage?.text ||
      original?.message?.imageMessage?.caption ||
      original?.message?.videoMessage?.caption;
    if (!content) {
      console.log(`No content found for the original message with ID ${msgID}.`);
      return;
    }
    const notificationText = `${content}`;
    if (action === "me") {
      await sock.sendMessage(
        sock.user.id.split(":")[0] + "@s.whatsapp.net",
        {
          text: notificationText,
        },
        { quoted: original },
      );
    } else if (isJid(action)) {
      await sock.sendMessage(
        action,
        {
          text: notificationText,
        },
        { quoted: original },
      );
    }
  } catch (error) {
    console.error("Error handling message revocation:", error);
  }
};

export default {
  name: "antidelete",
  description: "Prevents message deletion and notifies the user.",
  category: "utility",
  usage: "antidelete <me|jid|off>",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup, senderID, fromMe } = mellow;
    const action = args[0];
    if (!action) {
      return sock.sendMessage(chatID, {
        text: "Please provide an action: me, jid, or off.",
      });
    }
    if (action === "me") {
      await writeData([action], path.join(__dirname, "../data/antidelete.json"));
      return sock.sendMessage(chatID, {
        text: "Deleted messages will be sent to you.",
      });
    } else if (action === "off") {
      await writeData([action], path.join(__dirname, "../data/antidelete.json"));
      return sock.sendMessage(chatID, {
        text: "Antidelete feature has been turned off.",
      });
    } else if (isJid(action)) {
      await writeData([action], path.join(__dirname, "../data/antidelete.json"));
      return sock.sendMessage(chatID, {
        text: "Deleted messages will be sent to the specified JID.",
      });
    } else {
      return sock.sendMessage(chatID, {
        text: "Invalid action. Please use: me, jid, or off.",
      });
    }
  },
};
