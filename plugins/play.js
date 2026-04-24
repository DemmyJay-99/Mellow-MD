import yts from "yt-search";
import axios from "axios";
export default {
  name: "play",
  description: "Play a song from YouTube",
  isPublic: false,
  category: "Downloaders",
  usage: ".play <song name>",
  execute: async (sock, msg, args) => {
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(msg.key.remoteJid, {text: "Please provide a song name."});
    }
    const results = await yts(query);
    const url = results.videos.length > 0 ? results.all[0]?.url : null;
    if (!url) {
      return sock.sendMessage(msg.key.remoteJid, {text: "No results found."});
    }
    const response = await axios.get(`https://api-rebix.zone.id/api/ytdl?format=mp3&url=${url}`);
    const {result} = response.data;
    const songUrl = result?.url;
    if (!songUrl) {
      return sock.sendMessage(msg.key.remoteJid, {text: "Failed to retrieve the song."});
    }
    await sock.sendMessage(msg.key.remoteJid, {audio: {url: songUrl}, mimetype: "audio/mpeg"});

    if (results.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, {text: "No results found."});
    }
  },
};
