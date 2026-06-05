import {ttdl} from "ruhend-scraper";

export default {
  name: "tiktok",
  description: "Download Tiktok videos",
  category: "Downloaders",
  usage: "tiktok <TikTok URL> (or reply to a message with the URL)",
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessage, quotedMessageText, chatID } = mellow;
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedMessageText;
    }
    if (!url) {
      await sock.sendMessage(chatID, {
        text: "Usage: tiktok <TikTok URL> (or reply to a message with the URL)",
      });
      return;
    }
    function isTikTokUrlRegex(url) {
      const tiktokRegex = new RegExp(/https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/(@[\w.-]+\/video\/(\d+)|[\w.-]+)/i);
      return tiktokRegex.test(url);
    }
    if (!isTikTokUrlRegex(url)) {
      await sock.sendMessage(chatID, {text: "Invalid url"});
      return;
    }
    let video = await ttdl(url)[-];

    await sock.sendMessage(chatID, {video: {url: video}}}, {quoted: msg});
  },
};
