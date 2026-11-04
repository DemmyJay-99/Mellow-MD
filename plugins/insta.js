import { galleryDL } from "../lib/gallery-dl.js";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { print } from "../lib/log.js";

export default {
  name: "insta",
  description: "Download IG reels",
  category: "Downloaders",
  usage: "insta <Insta URL> (or reply to a message with the URL)",
  aliases: ["ig", "igdl"],
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
        text: "Usage: insta <Insta URL> (or reply to a message with the URL)",
      });
      return;
    }

    function checkInstagram(url) {
      const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)/i;
      return igRegex.test(url);
    }
    if (!checkInstagram(url)) {
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
          } else {
            await sock.sendMessage(chatID, {
              video: buffer,
              mimetype: "video/mp4",
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
      print("error", "Instagram error:" + e.message);
      if (e.message.includes("No results found")) {
        return await sock.sendMessage(chatID, {
          text: "No results found for this URL.",
        });
      }
      await sock.sendMessage(chatID, {
        text: "Failed to download Instagram content.",
      });
    }
  },
};
