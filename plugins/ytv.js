import {ytVideo} from "../lib/yt.js";
import fs from "fs";

export default {
  name: "ytv",
  description: "Download YouTube videos",
  usage: ".ytv <url> or reply to a YouTube video link with .ytv",
  category: "Downloaders",
  execute: async (sock, msg, args, mellow = {}) => {
    const {quotedMessageText, chatID} = mellow;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessageText) {
      url = quotedMessageText;
    }
    if (!url) {
      return await sock.sendMessage(chatID, {
        text: "Usage: .ytv <url> or reply to a YouTube video link with .ytv",
      });
    }
    function isYouTubeUrl(url) {
      const youtubeRegex =
        /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?][^\s]*)?$/;
      return youtubeRegex.test(url);
    }
    if (!isYouTubeUrl(url)) {
      return await sock.sendMessage(chatID, {
        text: "Please provide a valid YouTube video URL.",
      });
    }
    const COOKIE = process.env.YT_COOKIE;
    if (!COOKIE) {
      return sock.sendMessage(chatID, {
        text: "YT_COOKIE environment variable not set",
      });
    }
    try {
      const filepath = await ytVideo(url);
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
    } catch (error) {
      console.error("Error downloading YouTube video:", error);
      await sock.sendMessage(chatID, {
        text: "An error occurred while downloading the YouTube video.",
      });
    }
  },
};
