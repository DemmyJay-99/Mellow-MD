import { ytVideo } from "../lib/yt.js";

export default {
  name: "tiktok2",
  category: "Downloaders",
  aliases: ["tt2", "ttdl2", "tiktokdl2"],
  description: "Download Tiktok videos with this command if tiktok command is not working",
  usage: "tiktok2 <TikTok URL> (or reply to a message with the URL)",
  execute: async (sock, msg,args, mellow) => {
    const { quotedMessage, quotedMessageText, chatID, quotedLink } = mellow;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedLink || quotedMessageText;
    }
    if (!url) {
      await sock.sendMessage(chatID, {
        text: "Usage: tiktok2 <TikTok URL> (or reply to a message with the URL)",
      });
      return;
    }
    function isTikTokUrlRegex(url) {
      const tiktokRegex =
        /https?:\/\/(?:(?:www\.)?tiktok\.com\/@([\w.-]+)\/(?:video|photo)\/(\d+)|(?:vm|vt)\.tiktok\.com\/([\w-]+))/i;
      return tiktokRegex.test(url);
    }
    if (!isTikTokUrlRegex(url)) {
      await sock.sendMessage(chatID, { text: "Invalid url" });
      return;
    }
    try {
      const file = await ytVideo(url);
      await sock.sendMessage(chatID, {
        video: {url: file},
      });
    } catch (error) {
      console.error(error);
      await sock.sendMessage(chatID, { text: "Failed to download video" });
    }
  }
}