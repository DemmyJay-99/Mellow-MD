import {ytAudio} from "../lib/yt.js";

export default {
  name: "yta",
  description: "Download YouTube audio",
  usage: ".yta <url> or reply to a YouTube video link with .yta",
  category: "Downloaders",
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessageText, chatID } = mellow;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessageText) {
      url = quotedMessageText;
    }
    if (!url) {
      return await sock.sendMessage(chatID, {
        text: "Usage: .yta <url> or reply to a YouTube video link with .yta",
      });
    }
    function isYouTubeUrl(url) {
      const youtubeRegex =
        /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?][^\s]*)?$/;
      return youtubeRegex.test(url);
    }
    if (!isYouTubeUrl(url)) {
      return await sock.sendMessage(remoteJid, {
        text: "Please provide a valid YouTube video URL.",
      });
    }
    const COOKIE = process.env.YT_COOKIE;
    if (!COOKIE) {
      return sock.sendMessage(remoteJid, {
        text: "YT_COOKIE environment variable not set",
      });
    }
    try {
      const buffer = await ytAudio(url);
      if (!buffer || buffer.length === 0) {
        return sock.sendMessage(chatID, {
          text: "Downloaded file is empty",
        });
      }
      await sock.sendMessage(chatID, {
        audio: buffer,
        mimetype: "audio/mp4",
      });
    } catch (e) {
      console.log("YTA Error:", e.stack);
      await sock.sendMessage(chatID, {text: e.message});
    }
  },
};
