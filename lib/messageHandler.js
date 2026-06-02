import { hasSeenMessage, markMessageSeen } from "./store.js";
// import handleCommand from "./commandHandler.js";
import { CommandHandler } from "./command.js";
import { pullLatestUpdates } from "./update.js";
import normaliseJidToPN from "./normaliseJidToPN.js";
import isSudo from "../lib/isSudo.js";
import config from "../config.js";
import { restartProcess } from "./index.js";
const commandHandler = new CommandHandler();

const buttonMessageIDs = ["update now"];
const handleMessage = async (sock, message) => {
  const { messages, type } = message;
  if (type !== "notify") return;
  const msg = messages[0];
  if (!msg || !msg.message) return;
  const msgID = msg.key.id;
  const fromMe = msg.key.fromMe;
  const remoteJid = msg.key.participant || msg.key.remoteJid;
  if (hasSeenMessage(msgID)) {
    return;
  }

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
    const pn = await normaliseJidToPN(sock, remoteJid);
    if (!pn) {
      console.error(`Could not normalise JID to PN for sender: ${remoteJid}`);
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
  try {
    if (usedPrefix) {
      const args = messageText.slice(usedPrefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase()
      const command = commandHandler.getCommand(commandName);
      if (!command) return;
      command.execute(sock, msg, args);
    }
    markMessageSeen(msgID);
  } catch (error) {
    console.error("Error in message handler:", error);
  }
};

export default handleMessage;
