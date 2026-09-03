import normaliseJidToPN from "../lib/normaliseJidToPN.js";
import { getGroupConfig, setGroupConfig, getWarns, setWarns, isSenderAdmin } from "../lib/index.js";
import { LinkifyIt } from "linkify-it";
import tlds from "tlds" with { type: "json" };

const linkify = new LinkifyIt().tlds(tlds);

export const handleLinkDetection = async (sock, chatID, senderID, messageText, msgID, botID) => {
  try {
    const groupConfig = await getGroupConfig(chatID);
    if (!groupConfig || !groupConfig.enabled) {
      return;
    }
    const action = groupConfig.action || "delete";
    if (!linkify.test(messageText)) return;
    if (action === "warn") {
      const WARN_LIMIT = process.env.WARN_LIMIT || 3;
      const warns = await getWarns(chatID, senderID);
      if (warns + 1 >= WARN_LIMIT) {
        await sock.groupParticipantsUpdate(chatID, [senderID], "remove");
        await sock.sendMessage(chatID, {
          text: `@${senderID.split("@")[0]} has been kicked for sending too many links.`,
          mentions: [senderID],
        });
        await setWarns(chatID, senderID, 0);
        return;
      } else {
        const newWarnCount = warns + 1;
        await setWarns(chatID, senderID, newWarnCount);
        await sock.sendMessage(chatID, {
          text: `Warning @${senderID.split("@")[0]}! Links are not allowed in this group.\n Warn count: ${newWarnCount}`,
          mentions: [senderID],
        });
        await sock.sendMessage(chatID, {
          delete: {
            remoteJid: chatID,
            fromMe: false,
            id: msgID,
            participant: senderID,
          },
        });
      }
    } else if (action === "kick") {
      await sock.groupParticipantsUpdate(chatID, [senderID], "remove");
      await sock.sendMessage(chatID, {
        text: `@${senderID.split("@")[0]} has been kicked for sending a link.`,
        mentions: [senderID],
      });
      await sock.sendMessage(chatID, {
        delete: {
          remoteJid,
          fromMe: false,
          id: msgID,
          participant: senderID,
        },
      });
    } else if (action === "delete") {
      await sock.sendMessage(chatID, {
        text: `User sent a link. Deleting message.`,
      });
      await sock.sendMessage(chatID, {
        delete: { remoteJid: chatID, fromMe: false, id: msgID, participant: senderID },
      });
    }
  } catch (e) {
    console.error("Error in handleLinkDetection:", e);
  }
};

export default {
  name: "antilink",
  description: "Enable or disable antilink",
  category: "Group",
  usage: "antilink on|off|set <warn|kick|delete>",
  execute: async (sock, msg, args, mellow) => {
    const { chatID, chatIDisGroup, senderID } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const sender = (await normaliseJidToPN(sock, senderID)) + "@s.whatsapp.net";
    const isAdmin = await isSenderAdmin(sock, chatID, sender);
    if (!isAdmin) {
      return sock.sendMessage(chatID, {
        text: "You are not an admin.",
      });
    }
    const action = args[0];
    const groupConfig = await getGroupConfig(chatID);
    if (!action) {
      return sock.sendMessage(chatID, {
        text: "Please provide an action: on, off or set <action>.",
      });
    }
    if (action === "on") {
      await setGroupConfig(chatID, { ...groupConfig, enabled: true });
      await sock.sendMessage(chatID, {
        text: "Antilink enabled.",
      });
    } else if (action === "off") {
      await setGroupConfig(chatID, { ...groupConfig, enabled: false });
      await sock.sendMessage(chatID, {
        text: "Antilink disabled.",
      });
    } else if (action === "set") {
      const newAction = args[1];
      if (!newAction || !["warn", "kick", "delete"].includes(newAction)) {
        return sock.sendMessage(chatID, {
          text: "Invalid action. Use 'warn', 'kick', or 'delete'.",
        });
      }
      await setGroupConfig(chatID, { enabled: true, action: newAction });
      await sock.sendMessage(chatID, {
        text: `Antilink action set to ${newAction}.`,
      });
    }
  },
};
