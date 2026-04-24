import yts from "yt-search";
import axios from "axios";
import {transform, getFonts} from "convert-unicode-fonts";
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
    const video = results.videos.length > 0 ? results.all[0] : null;
    const url = video ? video.url : null;
    if (!url) {
      return sock.sendMessage(msg.key.remoteJid, {text: "No results found."});
    }
    const {title, thumbnail, timestamp} = video;
    const fonts = getFonts();
    const transformedTitle = transform(title, fonts["scriptBold"]);
    const mellow = transform("Mellow-MD✨".toUpperCase(), fonts["scriptBold"]);
    const message = `${mellow}\nDownloading *${transformedTitle}*\nDuration: ${timestamp}`;
    const m = await sock.sendMessage(msg.key.remoteJid, {
      image: {url: thumbnail},
      caption: message,
    });
    const response = await axios.get(`https://api-rebix.zone.id/api/ytdl?format=mp3&url=${url}`);
    const {result} = response.data;
    const {download} = result;

    if (!download) {
      return sock.sendMessage(msg.key.remoteJid, {text: "Failed to retrieve the song."});
    }
    await sock.sendMessage(msg.key.remoteJid, {audio: {url: download}, mimetype: "audio/mpeg"}, {quoted: m});
  },
};
