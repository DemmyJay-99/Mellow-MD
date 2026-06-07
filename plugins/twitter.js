import fs from "fs";
import {twitterVideo} from "../lib/yt.js";

export default {
  name: "twitter",
  description: "Download Twitter videos",
  usage: ".twitter <url> or reply to a Twitter video url with .twitter",
  category: "Downloaders",
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessage, quotedMessageText, chatID } = mellow;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedMessageText;
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
      const filepath = await twitterVideo(url);
      const buffer = fs.readFileSync(filepath);
      await sock.sendMessage(chatID, {
        video: buffer,
        mimetype: "video/mp4",
      });
      try {
        fs.unlinkSync(filepath);
      } catch (error) {
        // console.error('Failed to delete temp video file:', err);
      }
    } catch (e) {
      console.error("twitter error:", e);
      await sock.sendMessage(chatID, {
        text: "Failed to download Twitter video.",
      });
    }
  },
};
