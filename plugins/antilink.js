import fs from "fs";
import normalizeJid from "../lib/normaliseLid.js";

const ANTILINK_FILE = "./data/antilink.json";
const WARN_FILE = "./data/warn.json";
const WARN_LIMIT = Number(process.env.WARN_LIMIT) || 3;

async function readData(FILE) {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data", { recursive: true });
  }
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

async function writeData(data, FILE) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

async function getGroupConfig(jid) {
  const data = await readData(ANTILINK_FILE);
  return data[jid] || { enabled: false, action: "delete" };
}

async function setGroupConfig(jid, config) {
  const data = await readData(ANTILINK_FILE);
  data[jid] = config;
  await writeData(data, ANTILINK_FILE);
}

async function getWarns(jid, sender) {
  const data = await readData(WARN_FILE);
  return data[jid]?.[sender] || 0;
}

async function setWarns(jid, sender, count) {
  const data = await readData(WARN_FILE);
  if (!data[jid]) data[jid] = {};
  data[jid][sender] = count;
  await writeData(data, WARN_FILE);
}

export default {
  name: "antilink",
  description: "Enable or disable antilink",
  isPublic: false,
  category: "Group",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(remoteJid, {
        text: "This command only works in groups.",
      });
    }

    const groupMetadata = await sock.groupMetadata(remoteJid);
    const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
    let sender = msg.key.participant || msg.key.remoteJid;
    if (sender.endsWith("@lid")) {
      const pn = await normalizeJid(sock, sender);
      sender = pn + "@s.whatsapp.net";
    }
    const isAdmin = groupAdmins.some((admin) => admin.id === sender);
    if (!isAdmin) {
      return sock.sendMessage(remoteJid, {
        text: "You are not an admin.",
      });
    }
    const action = args[0];
    const groupConfig = await getGroupConfig(remoteJid)
    if (!action) {
      return sock.sendMessage(remoteJid, {
        text: "Please provide an action: enable or disable.",
      });
    }
    if (action === "on") {
      await setGroupConfig(remoteJid, {...groupConfig, enabled: true });
      await sock.sendMessage(remoteJid, {
        text: "Antilink enabled.",
      });
    } else if (action === "off") {
      await setGroupConfig(remoteJid, { ...groupConfig, enabled: false });
      await sock.sendMessage(remoteJid, {
        text: "Antilink disabled.",
      })
    } else if (action === 'set') {
      const newAction = args[1];
      if (!newAction || !['warn', 'kick', 'delete'].includes(newAction)) {
        return sock.sendMessage(remoteJid, {
          text: "Invalid action. Use 'warn', 'kick', or 'delete'.",
        });
      }
      await setGroupConfig(remoteJid, { enabled: true, action: newAction });
      await sock.sendMessage(remoteJid, {
        text: `Antilink action set to ${newAction}.`
      })
    }
  },
  onMessage: async (sock, msg, body) => {
    if (msg.key.fromMe) return;
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) return;
    const groupConfig = await getGroupConfig(remoteJid);
    if (!groupConfig.enabled) return;
    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|t\.me|discord\.gg)/i;
    if (linkRegex.test(body)) {
      let sender = msg.key.participant || msg.key.remoteJid;
      if (sender.endsWith("@lid")) {
        const pn = await normalizeJid(sock, sender);
        sender = pn + "@s.whatsapp.net";
      }
      const groupMetadata = await sock.groupMetadata(remoteJid);
      const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
      const isAdmin = groupAdmins.some((admin) => admin.id === sender);
      if (isAdmin) return;
      if (groupConfig.action === "warn") {
        const warnCount = await getWarns(remoteJid, sender);  
        if (warnCount + 1 >= WARN_LIMIT) {
          await sock.groupParticipantsUpdate(remoteJid, [sender], "remove");
          await sock.sendMessage(remoteJid, {
            text: `@${sender.split("@")[0]} has been kicked for sending too many links.`,
            mentions: [sender],
          });
          await setWarns(remoteJid, sender, 0)
          return;
        }
        const newWarnCount = warnCount + 1;
        await setWarns(remoteJid, sender, newWarnCount)
        
        await sock.sendMessage(remoteJid, {
          text: `Warning @${sender.split("@")[0]}! Links are not allowed in this group.\n Warn count: ${newWarnCount}`,
          mentions: [sender],
        });
        await sock.sendMessage(remoteJid, {
          delete: {
            remoteJid,
            fromMe: false,
            id: msg.key.id,
            participant: sender,
          },
        });
      } else if (groupConfig.action === "kick") {
        await sock.groupParticipantsUpdate(remoteJid, [sender], "remove");
        await sock.sendMessage(remoteJid, {
          text: `@${sender.split("@")[0]} has been kicked for sending a link.`,
          mentions: [sender],
        });
      } else if (groupConfig.action === "delete") {
        await sock.sendMessage(remoteJid, {
          delete: {
            remoteJid,
            fromMe: false,
            id: msg.key.id,
            participant: sender,
          }
        })
      }
    }
  },
};
