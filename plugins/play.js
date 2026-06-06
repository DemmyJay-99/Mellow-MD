import yts from "yt-search";
import { ytAudio } from "../lib/yt.js";
export default {
  name: "play",
  description: "Search and download a song from YouTube",
  category: "Downloaders",
  usage: ".play <song name>",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID} = mellow;
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(chatID, {
        text: "Please provide a song name.",
      });
    }
    try {
      const results = await yts(query);
      const MAX_DURATION = 10 * 60;
      const video =
        results.videos.find((v) => v.seconds <= MAX_DURATION) || null;
      const url = video?.url ?? null;
      const { title, author, timestamp, image } = video || {};
      if (!url) {
        return sock.sendMessage(chatID, {
          text: "No results found.",
        });
      }
      const msg = `Downloading: ${title} | ${author.name}\nDuration: ${timestamp}\n*© MELLOW MD*`;
      await sock.sendMessage(chatID, {
        text: msg,
        contextInfo: {
          externalAdReply: {
            title: title,
            thumbnailUrl: image,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
      const COOKIE = process.env.YT_COOKIE;
      if (!COOKIE) {
        return sock.sendMessage(chatID, {
          text: "YT_COOKIE environment variable not set",
        });
      }
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
      console.log("Play Error:", e.stack);
      await sock.sendMessage(chatID, { text: e.message });
    }
  },
};
