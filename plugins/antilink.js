import fs from "fs";
import normalizeJid from "../lib/normaliseLid.js";

const FILE = "./data/antilink.json";

async function readData() {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data", { recursive: true });
  }
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

async function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

async function getGroupConfig(jid) {
  const data = await readData();
  return data[jid] || { enabled: false, action: "delete" };
}

async function setGroupConfig(jid, config) {
  const data = await readData();
  data[jid] = config;
  await writeData(data);
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
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) return;
    const groupConfig = await getGroupConfig(remoteJid);
    if (!groupConfig.enabled) return;
    const linkRegex = /https?:\/\/\S+/gi;
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
        await sock.sendMessage(remoteJid, {
          text: `Warning @${sender.split("@")[0]}! Links are not allowed in this group.`,
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
