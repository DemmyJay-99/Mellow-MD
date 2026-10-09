import yts from "yt-search";
import { ytAudio } from "../lib/yt.js";
import fs from "fs";
import { fetchBuffer } from "../lib/index.js";
import id3 from "node-id3";
import { print } from "../lib/log.js";

export default {
  name: "play",
  description: "Search and download a song from YouTube",
  category: "Downloaders",
  usage: ".play <song name>",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID } = mellow;
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(chatID, {
        text: "Please provide a song name.",
      });
    }
    try {
      const results = await yts(query);
      const MAX_DURATION = 10 * 60;
      const video = results.videos.find((v) => v.seconds <= MAX_DURATION) || null;
      const url = video?.url ?? null;
      const { title, author, timestamp, image, description } = video || {};
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
      const filepath = await ytAudio(url);
      const tags = {
        title,
        artist: author.name,
        image: {
          mime: "image/jpeg",
          type: {
            id: 3,
            name: "front cover",
          },
          imageBuffer: await fetchBuffer(image),
        },
        description,
      };
      id3.write(tags, filepath);
      const buffer = fs.readFileSync(filepath);
      if (!buffer || buffer.length === 0) {
        return sock.sendMessage(chatID, {
          text: "Downloaded file is empty",
        });
      }
      await sock.sendMessage(chatID, {
        audio: buffer,
        mimetype: "audio/mp4",
      });
      try {
        fs.unlinkSync(filepath);
      } catch (error) {
        print("error",'Failed to delete temp video file:' + error.message);
      }
    } catch (e) {
      print("error", "Play Error:" + e.stack);
      await sock.sendMessage(chatID, { text: e.message });
    }
  },
};
