import DataBase from "better-sqlite3";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import path from "path";
import { fileURLToPath } from "url";
import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import { createWriteStream } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = new DataBase("./data/baileys_store.db");
sqlite.pragma("journal_mode = WAL");

const createMessageTable = () => {
  sqlite.exec(
    `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY
        , jid TEXT NOT NULL
        , timestamp INTEGER NOT NULL
        , data TEXT NOT NULL
    )`,
  );
};

createMessageTable();

const store = {
  insertStmt: sqlite.prepare("INSERT OR REPLACE INTO messages (id, jid, timestamp, data) VALUES (?, ?, ?, ?)"),
  getStmt: sqlite.prepare("SELECT data FROM messages WHERE id = ?"),
  cleanUpStmt: sqlite.prepare("DELETE FROM messages WHERE timestamp < ?"),
  getOldMessagesStmt: sqlite.prepare("SELECT id, data FROM messages WHERE timestamp < ?"),
  msgMaxAge: 2 * 60 * 1000, // 2 minutes in milliseconds
  cleanUpInterval: 60 * 60 * 1000, // 1 hour in milliseconds
  tmpDir: path.join(__dirname, "../tmp/media"),
  createTmpDir: async function () {
    try {
      await mkdir(this.tmpDir, { recursive: true });
    } catch (err) {
      console.error(`Error creating temporary media directory: ${err.message}`);
    }
  },
  cleanUpOldMessages: async function () {
    const cutoffTimestamp = Date.now() - this.msgMaxAge;
    const oldMessages = this.getOldMessagesStmt.all(cutoffTimestamp);
    for (const { data } of oldMessages) {
      const parsedData = JSON.parse(data);
      if (parsedData.mediaPath) {
        try {
          await unlink(parsedData.mediaPath);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.error(`Error deleting media file ${parsedData.mediaPath}: ${err.message}`);
          }
        }
      }
    }
    const result = this.cleanUpStmt.run(cutoffTimestamp);
    console.log(`Cleaned up ${result.changes} old messages from the database.`);
  },
  trimMsgObject: function (msg) {
    return {
      key: msg.key,
      message: msg.message,
      messageTimestamp: msg.messageTimestamp,
      pushName: msg.pushName,
    };
  },
  downloadMedia: async function (msg, mediaType, filePath) {
    const stream = await downloadContentFromMessage(msg.message[`${mediaType}Message`], mediaType);
    const fileStream = createWriteStream(filePath);
    try {
      for await (const chunk of stream) {
        if (!fileStream.write(chunk)) {
          await new Promise((resolve, reject) => {
            fileStream.once("drain", resolve);
            fileStream.once("error", reject);
          });
        }
      }
      await new Promise((resolve, reject) => {
        fileStream.end(resolve);
        fileStream.once("error", reject);
      });
    } catch (err) {
      console.error(`Error downloading media for message ${msg.key.id}: ${err.message}`);
      fileStream.destroy();
      await unlink(mediaPath).catch(() => {});
      throw err;
    }
  },
  saveMessage: async function (msg) {
    const trimmedMsg = this.trimMsgObject(msg);
    if (!msg?.key?.id || !msg?.key?.remoteJid) return;
    const msgId = trimmedMsg.key.id;
    const jid = trimmedMsg.key.remoteJid;
    const timestamp = Number(trimmedMsg.messageTimestamp);
    const timestampMs = timestamp > 1e12 ? timestamp : timestamp * 1000; // Convert to milliseconds if in seconds
    let content = null;
    let mediaType = null;
    let mediaPath = null;
    let fileName = null;
    let mimeType = null;
    let audioPtt = null;
    const imageMessage = trimmedMsg.message?.imageMessage;
    const videoMessage = trimmedMsg.message?.videoMessage;
    if (imageMessage) {
      content = imageMessage.caption || "";
      mediaType = "image";
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.jpg`);
      await this.downloadMedia(trimmedMsg, "image", mediaPath);
    } else if (videoMessage) {
      content = videoMessage.caption || "";
      mediaType = "video";
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.mp4`);
      await this.downloadMedia(trimmedMsg, "video", mediaPath);
    } else if (trimmedMsg.message?.stickerMessage) {
      content = trimmedMsg.message.stickerMessage.caption || "";
      mediaType = "sticker";
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.webp`);
      await this.downloadMedia(trimmedMsg, "sticker", mediaPath);
    } else if (trimmedMsg.message?.documentMessage) {
      content = trimmedMsg.message.documentMessage.caption || "";
      mediaType = "document";
      await this.createTmpDir();
      fileName = trimmedMsg.message.documentMessage.fileName || `${msgId}.dat`;
      const ext = path.extname(fileName) || ".dat";
      mimeType = trimmedMsg.message.documentMessage.mimetype;
      mediaPath = path.join(this.tmpDir, `${msgId}${ext}`);
      await this.downloadMedia(trimmedMsg, "document", mediaPath);
    } else if (trimmedMsg.message?.audioMessage) {
      content = trimmedMsg.message.audioMessage.caption || "";
      mediaType = "audio";
      audioPtt = trimmedMsg.message.audioMessage.ptt || false;
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.ogg`);
      await this.downloadMedia(trimmedMsg, "audio", mediaPath);
    } else if (trimmedMsg.message?.stickerMessage) {
      content = trimmedMsg.message.stickerMessage.caption || "";
      mediaType = "sticker";
      const stream = await downloadContentFromMessage(trimmedMsg.message.stickerMessage, "sticker");
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      await this.createTmpDir();
      mediaPath = path.join(this.tmpDir, `${msgId}.webp`);
      await writeFile(mediaPath, buffer);
    } else if (trimmedMsg.message?.documentMessage) {
      content = trimmedMsg.message.documentMessage.caption || "";
      mediaType = "document";
      const stream = await downloadContentFromMessage(trimmedMsg.message.documentMessage, "document");
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      await this.createTmpDir();
      fileName = trimmedMsg.message.documentMessage.fileName || `${msgId}.dat`;
      const ext = path.extname(fileName) || ".dat";
      mimeType = trimmedMsg.message.documentMessage.mimetype;
      mediaPath = path.join(this.tmpDir, `${msgId}${ext}`);
      await writeFile(mediaPath, buffer);
    } else if (trimmedMsg.message?.audioMessage) {
      content = trimmedMsg.message.audioMessage.caption || "";
      mediaType = "audio";
      audioPtt = trimmedMsg.message.audioMessage.ptt || false;
      const stream = await downloadContentFromMessage(trimmedMsg.message.audioMessage, "audio");
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      await this.createTmpDir();
      mimeType = trimmedMsg.message.audioMessage.mimetype || "audio/mpeg";
      fileName = `${msgId}${mimeType === "audio/ogg" ? ".ogg" : ".mp3"}`;
      mediaPath = path.join(this.tmpDir, fileName);
      await writeFile(mediaPath, buffer);
    } else {
      content = trimmedMsg.message?.conversation || trimmedMsg.message?.extendedTextMessage?.text || "";
    }
    const data = {
      ...trimmedMsg,
      content,
      mediaType,
      mediaPath,
      fileName,
      mimeType,
      audioPtt,
    };
    this.insertStmt.run(msgId, jid, timestampMs, JSON.stringify(data));
  },
  getMedia: async function (message) {
    if (!message.mediaPath) return null;
    try {
      const buffer = await readFile(message.mediaPath);
      return buffer;
    } catch (err) {
      console.error(`Error reading media file ${message.mediaPath}: ${err.message}`);
      return null;
    }
  },
  getMessage: function (msgId) {
    const row = this.getStmt.get(msgId);
    return row ? JSON.parse(row.data) : undefined;
  },
};

await store.createTmpDir();
await store.cleanUpOldMessages();

setInterval(async () => {
  try {
    console.log("Running cleanup of old messages...");
    await store.cleanUpOldMessages();
  } catch (err) {
    console.error(`Error during cleanup of old messages: ${err.message}`);
  }
}, store.cleanUpInterval); // Run cleanup every 1 hour

export default store;
