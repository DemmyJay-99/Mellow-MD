import { getWarns, setWarns, isSenderAdmin, getAntigStatus, setAntigStatus } from "../lib/index.js";
import { explicitLog, print } from "../lib/log.js";

export const handleGroupStatusMentionMessage = async (sock, chatID, senderID, msgID, botID) => {
  if (senderID === botID) return;
  const config = await getAntigStatus(chatID);
  if (!config || !config.enabled) {
    return;
  }
  
  const action = config.action || "delete";
  const isAdmin = await isSenderAdmin(sock, senderID, chatID);
  if (isAdmin) {
    explicitLog(`Sender ${senderID} is an admin. No action taken.`);
    return;
  }
  if (action === "warn") {
    const WARN_LIMIT = process.env.WARN_LIMIT || 3;
    const warns = await getWarns(chatID, senderID);
    if (warns + 1 >= WARN_LIMIT) {
      await sock.groupParticipantsUpdate(chatID, [senderID], "remove");
      await sock.sendMessage(chatID, {
        text: `@${senderID.split("@")[0]} has been kicked for mentioning the group to their status post`,
        mentions: [senderID],
      });
      await setWarns(chatID, senderID, 0);
      return;
    } else {
      const newWarnCount = warns + 1;
      await setWarns(chatID, senderID, newWarnCount);
      await sock.sendMessage(chatID, {
        text: `Warning @${senderID.split("@")[0]}! Do not mention the group in your status.\n Warn count: ${newWarnCount}`,
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
      text: `@${senderID.split("@")[0]} has been kicked for mentioning the group in their status post`,
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
  } else if (action === "delete") {
    await sock.sendMessage(chatID, {
      text: `User tagged the group in their status. Deleting message.`,
    });
    await sock.sendMessage(chatID, {
      delete: { remoteJid: chatID, fromMe: false, id: msgID, participant: senderID },
    });
  }
};

export default {
  name: "antigstatus",
  description: "Enable or disable anti group status",
  usage: "antigstatus on|off|set <warn|kick|delete>",
  aliases: ["agstatus"],
  execute: async function (sock, msg, args, mellow = {}) {
    const { chatID, chatIDisGroup, senderID } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const isAdmin = await isSenderAdmin(sock, senderID, chatID);
    if (!isAdmin) {
      return sock.sendMessage(chatID, {
        text: "You are not an admin.",
      });
    }
    const action = args[0];
    if (!action) {
      return sock.sendMessage(chatID, {
        text: "Please provide an action: on, off or set <action>.",
      });
    }
    const config = await getAntigStatus(chatID);
    if (action === "on") {
      await setAntigStatus(chatID, { ...config, enabled: true });
      await sock.sendMessage(chatID, {
        text: "Anti-group-status enabled.",
      });
    } else if (action === "off") {
      await setAntigStatus(chatID, { ...config, enabled: false });
      await sock.sendMessage(chatID, {
        text: "Anti-group-status disabled.",
      });
    } else if (action === "set") {
      const newAction = args[1];
      if (!newAction || !["warn", "kick", "delete"].includes(newAction)) {
        return sock.sendMessage(chatID, {
          text: "Invalid action. Use 'warn', 'kick', or 'delete'.",
        });
      }
      await setAntigStatus(chatID, { enabled: true, action: newAction });
      await sock.sendMessage(chatID, {
        text: `Anti-group-status action set to ${newAction}.`,
      });
    }
  },
};
