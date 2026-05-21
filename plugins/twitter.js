import fs from "fs";
import {twitterVideo} from "../lib/yt.js";

export default {
  name: "twitter",
  description: "Download Twitter videos",
  usage: ".twitter <url> or reply to a Twitter video url with .twitter",
  category: "Downloaders",
  execute: async (sock, msg, args, quotedMessage) => {
    const remoteJid = msg.key.remoteJid;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text;
    }
    if (!url) {
      return await sock.sendMessage(remoteJid, {
        text: "Usage: .twitter <url> or reply to a Twitter video url with .twitter",
      });
    }
    function isTwitterUrl(url) {
      const twitterRegex =
        /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\?.*)?/i;
      return twitterRegex.test(url);
    }
    if (!isTwitterUrl(url)) {
      return await sock.sendMessage(remoteJid, {
        text: "Invalid Twitter URL.",
      });
    }
    try {
      const filepath = await twitterVideo(url);
      const buffer = fs.readFileSync(filepath);
      await sock.sendMessage(remoteJid, {
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
      await sock.sendMessage(remoteJid, {
        text: "Failed to download Twitter video.",
      });
    }
  },
};
