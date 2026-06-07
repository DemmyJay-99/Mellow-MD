import {fbdl} from "ruhend-scraper";

export default {
  name: "fb",
  description: "Download Facebook videos",
  category: "Downloaders",
  usage: "fb <fb URL> (or reply to a message with the URL)",
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
        text: "Usage: fb <fb URL> (or reply to a message with the URL)",
      });
      return;
    }
    function isFb(url) {
      const fbRegex = new RegExp(
        /https?:\/\/(www\.)?facebook\.com\/(share\/v\/[A-Za-z0-9]+\/?|[^\/]+\/videos\/\d+|watch\/\?v=\d+)/i,
      );
      return fbRegex.test(url);
    }
    if (!isFb(url)) {
      await sock.sendMessage(chatID, {text: "Invalid url"});
      return;
    }
    const res = await fbdl(url);
    const video = res[0]
    await sock.sendMessage(chatID, {video: {url: video}});
  },
};
