import DataBase from "better-sqlite3";
import mongoose from "mongoose";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import path from "path";
import { fileURLToPath } from "url";
import { mkdir, unlink, readFile, readdir, stat } from "fs/promises";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { explicitLog, print } from "./log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
let saveContactStmt;
let getContactStmt;
let getAllContactsStmt;
let getMsgStmt;
let cleanUpMsgStmt;
let getOldMessagesStmt;
let msgInsertStmt;
let msgSchema;
let Message;
let contactSchema;
let Contact;

let storage;
const MONGO_URL = process.env.MONGO_URL;
if (MONGO_URL) {
  storage = "mongo";
} else {
  storage = "sqlite";
}

const adapters = {
  sqlite: {
    init: () => {
      db = new DataBase("./data/store.db");
      db.pragma("journal_mode = WAL");
      db.exec(
        `CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY
            , jid TEXT NOT NULL
            , timestamp INTEGER NOT NULL
            , data TEXT NOT NULL
            )`,
      );
      db.exec(
        `CREATE TABLE IF NOT EXISTS contacts (
              id TEXT PRIMARY KEY,
              name TEXT,
              notify TEXT,
              verified_name TEXT,
              timestamp INTEGER NOT NULL
            )`,
      );
      msgInsertStmt = db.prepare("INSERT OR REPLACE INTO messages (id, jid, timestamp, data) VALUES (?, ?, ?, ?)");
      getMsgStmt = db.prepare("SELECT data FROM messages WHERE id = ?");
      cleanUpMsgStmt = db.prepare("DELETE FROM messages WHERE timestamp < ?");
      getOldMessagesStmt = db.prepare("SELECT id, data FROM messages WHERE timestamp < ?");
      // contacts: update without wiping existing values
      saveContactStmt = db.prepare(`
          INSERT INTO contacts (id, name, notify, verified_name, timestamp)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = COALESCE(excluded.name, name),
            notify = COALESCE(excluded.notify, notify),
            verified_name = COALESCE(excluded.verified_name, verified_name),
            timestamp = excluded.timestamp
    `);
      getContactStmt = db.prepare("SELECT * FROM contacts WHERE id = ?");
      getAllContactsStmt = db.prepare("SELECT * FROM contacts");
    },
    save: (data) => {
      const { id, jid, timestampMs } = data;
      msgInsertStmt.run(id, jid, timestampMs, JSON.stringify(data));
    },
    getMessage: (id) => {
      const row = getMsgStmt.get(id);
      return row ? JSON.parse(row.data) : undefined;
    },
    saveContact: (contact) => {
      const { id, name, notify, verified_name } = contact;
      saveContactStmt.run(id, name ?? null, notify ?? null, verified_name ?? null, Date.now());
    },
    getContact: (id) => {
      const row = getContactStmt.get(id);
      return row || undefined;
    },
    getAllContacts: () => {
      return getAllContactsStmt.all();
    },
    getOldMessages: (cutoff) => {
      return getOldMessagesStmt.all(cutoff);
    },
    deleteOldMessages: (cutoff) => {
      return cleanUpMsgStmt.run(cutoff);
    },
  },
  mongo: {
    init: () => {
      mongoose.connect(MONGO_URL);
      msgSchema = new mongoose.Schema({
        jid: { type: String, required: true },
        id: { type: String, unique: true, required: true },
        data: { type: String, required: true },
        timestamp: { type: Number, required: true },
      });
      Message = mongoose.model("Message", msgSchema);
      contactSchema = new mongoose.Schema({
        id: { type: String, unique: true, required: true },
        name: { type: String, default: "" },
        notify: String,
        verified_name: String,
        timestamp: { type: Number, default: Date.now },
      });
      Contact = mongoose.model("Contact", contactSchema);
    },
    save: async (data) => {
      const { id, jid, timestampMs } = data;
      await Message.updateOne(
        { id },
        {
          $set: {
            jid,
            timestamp: timestampMs,
            data: JSON.stringify(data),
          },
        },
        { upsert: true },
      );
    },
    getMessage: async (id) => {
      const row = await Message.findOne({ id });
      return row ? JSON.parse(row.data) : undefined;
    },
    saveContact: async (contact) => {
      const { id, name, notify, verified_name } = contact;
      await Contact.updateOne(
        { id },
        {
          $set: {
            id,
            name,
            notify,
            verified_name,
            timestamp: Date.now(),
          },
        },
        { upsert: true },
      );
    },
    getContact: async (id) => {
      const row = await Contact.findOne({ id });
      return row || undefined;
    },
    getAllContacts: async () => {
      return await Contact.find().select("-_id -_v").lean();
    },
    getOldMessages: async (cutoff) => {
      return await Message.find({ timestamp: { $lt: cutoff } }, { id: 1, data: 1, _id: 0 }).lean();
    },
    deleteOldMessages: async (cutoff) => {
      const result = await Message.deleteMany({
        timestamp: { $lt: cutoff },
      });
      return { changes: result.deletedCount };
    },
  },
};

/**
 * Store adapter for handling message and contact storage
 */

const store = {
  msgMaxAge: Number(process.env.MSG_MAX_AGE) || 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
  cleanUpInterval: 60 * 60 * 1000, // 1 hour in milliseconds
  tmpDir: path.join(__dirname, "../tmp/media"),
  init: function () {
    try {
      adapters[storage].init();
    } catch (e) {
      print("error", e.message);
      throw e;
    }
  },
  trimMsgObject: function (msg) {
    return {
      id: msg.key.id,
      jid: msg.key.remoteJid,
      key: msg.key,
      message: msg.message,
      messageTimestamp: msg.messageTimestamp,
      pushName: msg.pushName,
    };
  },
  createTmpDir: async function () {
    try {
      await mkdir(this.tmpDir, { recursive: true });
    } catch (err) {
      print("error", `Error creating temporary media directory: ${err.message}`);
    }
  },
  sweepTmpDir: async function (dir, maxAge) {
    const cutoff = Date.now() - maxAge;
    for (const name of await readdir(dir)) {
      const file = path.join(dir, name);
      try {
        if ((await stat(file)).mtimeMs < cutoff) await unlink(file);
      } catch {}
    }
  },
  cleanUpOldMessages: async function () {
    const cutoffTimestamp = Date.now() - this.msgMaxAge;
    const oldMessages = await adapters[storage].getOldMessages(cutoffTimestamp);
    for (const { data } of oldMessages) {
      const parsedData = JSON.parse(data);
      if (parsedData.mediaPath) {
        try {
          await unlink(parsedData.mediaPath);
        } catch (err) {
          if (err.code !== "ENOENT") {
            print("error", `Error deleting media file ${parsedData.mediaPath}: ${err.message}`);
          }
        }
      }
    }
    await this.sweepTmpDir(this.tmpDir, this.msgMaxAge);
    const result = await adapters[storage].deleteOldMessages(cutoffTimestamp);
    explicitLog(`Cleaned up ${result.changes} old messages from the database.`);
  },
  downloadMedia: async function (msg, mediaType, filePath) {
    try {
      const stream = await downloadContentFromMessage(msg, mediaType);
      await pipeline(stream, createWriteStream(filePath));
    } catch (err) {
      print("error", `Error downloading media for message ${msg.key.id}: ${err.message}`);
      await unlink(filePath).catch(() => {});
      throw err;
    }
  },
  saveMessage: async function (msg) {
    if (!msg?.key?.id || !msg?.key?.remoteJid) return;
    const trimmedMsg = this.trimMsgObject(msg);
    const msgId = trimmedMsg.key.id.replace(/[^\w-]/g, "_");
    const jid = trimmedMsg.key.remoteJid;
    const timestamp = Number(trimmedMsg.messageTimestamp);
    const timestampMs = timestamp > 1e12 ? timestamp : timestamp * 1000; // Convert to milliseconds if in seconds
    let content = "";
    let mediaType = null;
    let mediaPath = null;
    let fileName = null;
    let mimeType = null;
    let audioPtt = null;
    const imageMessage = msg.message?.associatedChildMessage?.message?.imageMessage || trimmedMsg.message?.imageMessage;
    const videoMessage = msg.message?.associatedChildMessage?.message?.videoMessage || trimmedMsg.message?.videoMessage;
    const audioMessage = trimmedMsg.message?.audioMessage;
    const documentMessage = trimmedMsg.message?.documentMessage;
    const stickerMessage = trimmedMsg.message?.stickerMessage;
    const albumMessage = trimmedMsg.message?.albumMessage;
    const contactMessage = trimmedMsg.message?.contactMessage;
    const communityReplyMessage = trimmedMsg.message?.encCommentMessage;
    const statusGroupMentionMessage = trimmedMsg.message.groupStatusMentionMessage;
    const reactionMessage = trimmedMsg.message.reactionMessage;
    if (reactionMessage) return;
    if (statusGroupMentionMessage) return;
    if (communityReplyMessage) return;
    if (albumMessage) return;
    if (contactMessage) return;
    if (jid.endsWith("@newsletter")) return;

    if (imageMessage) {
      content = imageMessage.caption || "";
      mediaType = "image";
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.jpg`);
      try {
        await this.downloadMedia(imageMessage, "image", mediaPath);
      } catch {
        mediaPath = null;
      }
    } else if (videoMessage) {
      content = videoMessage.caption || "";
      mediaType = "video";
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.mp4`);
      try {
        await this.downloadMedia(videoMessage, "video", mediaPath);
      } catch {
        mediaPath = null;
      }
    } else if (stickerMessage) {
      mediaType = "sticker";
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.webp`);
      try {
        await this.downloadMedia(stickerMessage, "sticker", mediaPath);
      } catch {
        mediaPath = null;
      }
    } else if (documentMessage) {
      content = documentMessage.caption || "";
      mediaType = "document";
      await this.createTmpDir();
      fileName = documentMessage.fileName || `${msgId}.dat`;
      const ext = path.extname(fileName) || ".dat";
      mimeType = documentMessage.mimetype;
      mediaPath = path.join(this.tmpDir, `${msgId}${ext}`);
      try {
        await this.downloadMedia(documentMessage, "document", mediaPath);
      } catch {
        mediaPath = null;
      }
    } else if (audioMessage) {
      mediaType = "audio";
      audioPtt = audioMessage.ptt || false;
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.ogg`);
      try {
        await this.downloadMedia(audioMessage, "audio", mediaPath);
      } catch {
        mediaPath = null;
      }
    } else {
      content = trimmedMsg.message?.conversation || trimmedMsg.message?.extendedTextMessage?.text || "";
      if (content === "") {
        explicitLog(trimmedMsg?.message);
      }
    }
    const data = {
      ...trimmedMsg,
      content,
      mediaType,
      mediaPath,
      fileName,
      mimeType,
      audioPtt,
      timestampMs,
    };
    try {
      await adapters[storage].save(data);
    } catch (error) {
      print("error", error.message);
    }
  },
  getMedia: async function (message) {
    if (!message.mediaPath) return null;
    try {
      const buffer = await readFile(message.mediaPath);
      return buffer;
    } catch (err) {
      print("error", `Error reading media file ${message.mediaPath}: ${err.message}`);
      return null;
    }
  },
  getMessage: async function (msgId) {
    try {
      const msg = await adapters[storage].getMessage(msgId);
      return msg;
    } catch (error) {
      print("error", error.message);
    }
  },
  saveContact: async function (contact) {
    await adapters[storage].saveContact(contact);
  },
  getContact: async function (jid) {
    return await adapters[storage].getContact(jid);
  },
  getAllContacts: async function () {
    return await adapters[storage].getAllContacts();
  },
};

store.init();
await store.createTmpDir();
await store
  .cleanUpOldMessages()
  .catch((e) => print("error", e.message))
  .then(() => store.sweepTmpDir(store.tmpDir, store.msgMaxAge));

setInterval(async () => {
  try {
    explicitLog("Running cleanup of old messages...");
    await store.cleanUpOldMessages();
  } catch (err) {
    print("error", `Error during cleanup of old messages: ${err.message}`);
  }
}, store.cleanUpInterval); // Run cleanup every 1 hour

export default store;
