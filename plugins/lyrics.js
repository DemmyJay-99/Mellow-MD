import genius from "genius-lyrics";
import {getLyrics} from "../lib/lyrics.js";
const Client = new genius.Client(process.env.GENIUS_API_KEY);

export default {
  name: "lyrics",
  description: "Get song lyrics",
  category: "Media",
  usage: "Reply to a song name with .lyrics, or use .lyrics <song name>",
  execute: async (sock, msg, args, mellow = {}) => {
    const {chatID, quotedMessageText} = mellow;
    const API_KEY = process.env.GENIUS_API_KEY;
    if (!API_KEY) {
      return sock.sendMessage(chatID, {
        text: "set GENIUS_API_KEY",
      });
    }
    let song;
    song = quotedMessageText || args.join(" ");
    if (!song) {
      return sock.sendMessage(chatID, {
        text: "Provide a song name.",
      });
    }
    const searches = await Client.songs.search(song);
    if (!searches) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "Song not found.",
      });
    }
    const search = searches[0];
    if (!search) {
      return await sock.sendMessage(chatID, {
        text: "Song not found.",
      });
    }
    const artistName = search?.artist?.name;
    const title = search?.title;
    const songImage = search?.image;
    const lyrics = await getLyrics(artistName, title);
    await sock.sendMessage(chatID, {
      image: {url: songImage},
      caption: `*${title} by ${artistName} (lyrics)*\n\n${lyrics}`,
    });
  },
};
