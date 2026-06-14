import { commandHandler } from "./command.js";
import { pullLatestUpdates } from "./update.js";
import normaliseJidToPN from "./normaliseJidToPN.js";
import { isSudo } from "../lib/sudo.js";
import config from "../config.js";
import { restartProcess, clearReact, reactToMessage } from "./index.js";
import { isEnabled } from "./perm.js";
import { saveMessage } from "./db.js";
import isEmoji from "is-emoji";
import p from "../package.json" with { type: "json" };

const buttonMessageIDs = ["update now"];
const emojiValue = process.env.REACT_EMOJI || config.reactEmoji || "";
let reactEmoji = Array.from(emojiValue)[0] || null;
if (!reactEmoji || !isEmoji(reactEmoji)) {
  reactEmoji = "✅";
}
const handleMessage = async (sock, message) => {
  const { messages, type } = message;
  if (type !== "notify") return;
  const msg = messages[0];
  if (!msg || !msg.message) return;
  saveMessage(msg);
  const msgID = msg.key.id;
  const fromMe = msg.key.fromMe;
  const chatID = msg.key.remoteJid;
  const senderID = msg.key.participant || msg.key.remoteJid;
  const botID = sock.user.id.split(":")[0] + "@s.whatsapp.net";
  const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
  const quotedMessage = ctxInfo?.quotedMessage;
  const quotedMessageText =
    quotedMessage?.conversation ||
    quotedMessage?.extendedTextMessage?.text ||
    quotedMessage?.imageMessage?.caption ||
    quotedMessage?.videoMessage?.caption ||
    "";
  const chatIDisGroup = chatID.endsWith("@g.us");

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption;
  if (!text) return;
  const messageText = text.toLowerCase().trim();
  const prefix = process.env.PREFIX
    ? process.env.PREFIX.split(",")
    : config.prefix;
  const usedPrefix = prefix.find((p) => messageText.startsWith(p));
  if (msg.message.templateButtonReplyMessage) {
    const pn = await normaliseJidToPN(sock, senderID);
    if (!pn) {
      console.error(`Could not normalise JID to PN for sender: ${senderID}`);
      return;
    }
    const selectedId = msg.message.templateButtonReplyMessage.selectedId;
    if (buttonMessageIDs.includes(selectedId)) {
      if (selectedId === buttonMessageIDs[0]) {
        const isSudoUser = await isSudo(pn);
        if (fromMe || isSudoUser) {
          await pullLatestUpdates();
          console.log("Updated successfully. Restarting...");
          await sock.sendMessage(msg.key.remoteJid, {
            text: "Updated successfully. Restarting...",
          });
          await clearReact(sock, msg);
          setTimeout(() => restartProcess(), 1500);
        }
      }
    }
  }

  if (!messageText) {
    return;
  }

  const mellow = {
    fromMe,
    quotedMessage,
    quotedMessageText,
    chatID,
    senderID,
    botID,
    chatIDisGroup,
    ctxInfo,
  };

  try {
    if (usedPrefix) {
      const args = messageText.slice(usedPrefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();
      const command = commandHandler.getCommand(commandName);
      if (!command) return;
      if (chatIDisGroup && isEnabled(chatID, commandName)) {
        await reactToMessage(sock, msg, reactEmoji);
        await command.execute(sock, msg, args, mellow);
        await clearReact(sock, msg);
        return;
      }
      const isSudoUser = await isSudo(await normaliseJidToPN(sock, senderID));
      if (fromMe || isSudoUser) {
        await reactToMessage(sock, msg, reactEmoji);
        await command.execute(sock, msg, args, mellow);
        await clearReact(sock, msg);
      }
    }
    // saveMessage(msg);
  } catch (error) {
    // saveMessage(msg);
    console.log("Error handling message:", error);
    const botVersion = p.version;
    const errorMsg =
      `--- ERROR! ---` +
      `\n*Bot Version:* ${botVersion}` +
      `\n*Chat ID:* ${chatID}` +
      `\n*Error:* ${error.message}` +
      `\n*Report issues to:* https://t.me/mellowmdgc/2`;
    await sock.sendMessage(
      botID,
      {
        text: errorMsg,
      },
      { quoted: msg },
    );
    if (chatID !== botID) {
      await sock.sendMessage(chatID, {
        text: "An error occurred while processing your command.",
      });
    }
    await clearReact(sock, msg);
  }
};

export default handleMessage;
