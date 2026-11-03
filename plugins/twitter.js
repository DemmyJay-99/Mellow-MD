import fs from "fs";
import path from "path";
// import { twitterVideo } from "../lib/yt.js";
import { galleryDL } from "../lib/gallery-dl.js";
import { fileTypeFromBuffer } from "file-type";
import { print } from "../lib/log.js";

export default {
  name: "twitter",
  description: "Download Twitter videos",
  usage: ".twitter <url> or reply to a Twitter video url with .twitter",
  aliases: ["tw", "twitterdl", "xdl", "twdl", "xitter"],
  category: "Downloaders",
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessage, quotedMessageText, chatID, quotedLink } = mellow;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedLink || quotedMessageText;
    }
    if (!url) {
      return await sock.sendMessage(chatID, {
        text: "Usage: .twitter <url> or reply to a Twitter video url with .twitter",
      });
    }
    function isTwitterUrl(url) {
      const twitterRegex =
        /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\?.*)?/i;
      return twitterRegex.test(url);
    }
    if (!isTwitterUrl(url)) {
      return await sock.sendMessage(chatID, {
        text: "Invalid Twitter URL.",
      });
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
          console.error("Error processing file:", err);
          continue;
        }
      }
      await sock.sendMessage(chatID, {
        text: "Download complete!",
      });
      await fs.promises.rm(dir, { recursive: true });
    } catch (e) {
      console.error("Twitter error:", e);
      if (e.message.includes("No results found")) {
        return await sock.sendMessage(chatID, {
          text: "No results found for this URL.",
        });
      }
      await sock.sendMessage(chatID, {
        text: "Failed to download Twitter content.",
      });
    }
  },
};
