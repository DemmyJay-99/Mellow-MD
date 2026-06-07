import {igdl} from "ruhend-scraper";

export default {
  name: "insta",
  description: "Download IG reels",
  category: "Downloaders",
  usage: "insta <Insta URL> (or reply to a message with the URL)",
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
        text: "Usage: insta <Insta URL> (or reply to a message with the URL)",
      });
      return;
    }

    function checkInstagram(url) {
      const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)/i;
      return igRegex.test(url);
    }
    if (!checkInstagram(url)) {
      await sock.sendMessage(chatID, {text: "Invalid url"});
      return;
    }
    const res = await igdl(url);
    const data = res[0];
    await sock.sendMessage(chatID, {video: {url: data}});
  },
};
