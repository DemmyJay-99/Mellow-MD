import yts from "yt-search";
import { ytAudio } from "../lib/yt.js";
import writeTags from "../lib/id3.js";
export default {
  name: "play",
  description: "Play a song from YouTube",
  category: "Downloaders",
  usage: ".play <song name>",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "Please provide a song name.",
      });
    }
    try {
      const results = await yts(query);
      const MAX_DURATION = 10 * 60;
      const video =
        results.videos.find((v) => v.seconds <= MAX_DURATION) || null;
      const url = video?.url ?? null;
      if (!url) {
        return sock.sendMessage(remoteJid, {
          text: "No results found.",
        });
      }
      await sock.sendMessage(remoteJid, { text: `Downloading: ${url}\n\n*© MELLOW MD*` });
      const COOKIE = process.env.YT_COOKIE;
      if (!COOKIE) {
        return sock.sendMessage(remoteJid, {
          text: "YT_COOKIE environment variable not set",
        });
      }
      const { title, author, thumbnail } = video;
      const tags = {
        title,
        artist: author.name,
        image: {
          mime: "image/jpeg",
          type: {
            id: 3,
            name: "front cover",
          },
          description: "Thumbnail",
          imageBuffer: Buffer.from(
            await (await fetch(thumbnail)).arrayBuffer()
          ),
        },
      };
      const buffer = await ytAudio(url);
      const taggedBuffer = await writeTags(buffer, tags);
      if (!taggedBuffer || taggedBuffer.length === 0) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "Downloaded file is empty",
        });
      }
      await sock.sendMessage(remoteJid, {
        audio: taggedBuffer,
        mimetype: "audio/mp4",
      });
    } catch (e) {
      console.log("Play Error:", e.stack);
      await sock.sendMessage(remoteJid, { text: e.message });
    }
    // const downloadUrl = stdout.trim()
  },
};
