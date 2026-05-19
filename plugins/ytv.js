import {ytVideo} from "../lib/yt.js";
import fs from "fs";

export default {
  name: "ytv",
  description: "Download YouTube videos",
  usage: ".ytv <url> or reply to a YouTube video link with .ytv",
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
        text: "Usage: .ytv <url> or reply to a YouTube video link with .ytv",
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
    try {
      const filepath = await ytVideo(url);
      const buffer = fs.readFileSync(filepath);
      await sock.sendMessage(remoteJid, {
        video: buffer,
        mimetype: "video/mp4",
      });
      // fs.unlinkSync(filepath);
    } catch (error) {
      console.error("Error downloading YouTube video:", error);
      await sock.sendMessage(remoteJid, {
        text: "An error occurred while downloading the YouTube video.",
      });
    }
  },
};
