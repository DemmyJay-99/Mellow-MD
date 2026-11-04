import { galleryDL } from "../lib/gallery-dl.js";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { print } from "../lib/log.js";

export default {
  name: "tiktok",
  description: "Download Tiktok videos",
  category: "Downloaders",
  usage: "tiktok <TikTok URL> (or reply to a message with the URL)",
  aliases: ["tt", "tiktokdl", "tiktokdownload", "ttdl"],
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessage, quotedMessageText, chatID, quotedLink } = mellow;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedLink || quotedMessageText;
    }
    if (!url) {
      await sock.sendMessage(chatID, {
        text: "Usage: tiktok <TikTok URL> (or reply to a message with the URL)",
      });
      return;
    }
    function isTikTokUrlRegex(url) {
      const tiktokRegex =
        /https?:\/\/(?:(?:www\.)?tiktok\.com\/@([\w.-]+)\/(?:video|photo)\/(\d+)|(?:vm|vt)\.tiktok\.com\/([\w-]+))/i;
      return tiktokRegex.test(url);
    }
    if (!isTikTokUrlRegex(url)) {
      await sock.sendMessage(chatID, { text: "Invalid url" });
      return;
    }
    try {
      const dir = await galleryDL(url);
      const files = fs.readdirSync(dir);
      const fileCount = files.length;
      let currentFile = 1;
      const msg = await sock.sendMessage(chatID, {
        text: `Downloading ${currentFile} of ${fileCount} file${fileCount !== 1 ? "s" : ""}...`,
      });
      for (const file of files) {
        try {
          const filepath = path.join(dir, file);
          const buffer = fs.readFileSync(filepath);
          const { mime } = await fileTypeFromBuffer(buffer);
          if (mime.startsWith("image/")) {
            await sock.sendMessage(chatID, {
              image: buffer,
              mimetype: mime,
            });
          } else if (mime.startsWith("video/")) {
            await sock.sendMessage(chatID, {
              video: buffer,
              mimetype: "video/mp4",
            });
          } else if (mime.startsWith("audio/")) {
            await sock.sendMessage(chatID, {
              audio: buffer,
              mimetype: mime,
            });
          }
          fs.unlinkSync(filepath);
          currentFile++;
          await sock.sendMessage(chatID, {
            text:
              currentFile > fileCount
                ? `Downloaded ${fileCount} file${fileCount !== 1 ? "s" : ""}`
                : `Downloading ${currentFile} of ${fileCount} file${fileCount !== 1 ? "s" : ""}...`,
            edit: msg.key,
          });
        } catch (err) {
          print("error", "Error processing file:" + err.message);
          continue;
        }
      }
      await sock.sendMessage(chatID, {
        text: "Download complete!",
      });
      await fs.promises.rm(dir, { recursive: true });
    } catch (e) {
      print("error", "TikTok error:" + e.message);
      if (e.message.includes("No results found")) {
        return await sock.sendMessage(chatID, {
          text: "No results found for this URL.",
        });
      }
      await sock.sendMessage(chatID, {
        text: "Failed to download TikTok content.",
      });
    }
  },
};
