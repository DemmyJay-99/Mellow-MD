import genius from "genius-lyrics";
import { getLyrics } from "../lib/lyrics.js";
const Client = new genius.Client(process.env.GENIUS_API_KEY);

export default {
  name: "lyrics",
  description: "Get song lyrics",
  isPublic: false,
  category: "Media",
  execute: async (sock, msg, args, quotedMessage) => {
    let song;
    const repliedMessage =
      quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text;
    song = repliedMessage || args.join(" ");
    if (!song) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "Provide a song name.",
      });
    }
    const searches = await Client.songs.search(song);
    const search = searches[0];
    if (!search) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: "Song not found.",
      });
    }
    const artistName = search?.artist?.name;
    const title = search?.title;
    const songImage = search?.image;
    const lyrics = await getLyrics(artistName, title);
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: songImage },
      caption: `*${title} by ${artistName} (lyrics)*\n\n${lyrics}`,
    });
  },
};
