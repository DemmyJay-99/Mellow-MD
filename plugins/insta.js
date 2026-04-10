import {igdl} from "ruhend-scraper";

export default {
  name: "insta",
  description: "Download IG reels",
  isPublic: false,
  category: "Downloaders",
  usage: "insta <Insta URL> (or reply to a message with the URL)",
  execute: async (sock, msg, args, quotedMessage) => {
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text;
    }
    if (!url) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Usage: insta <Insta URL> (or reply to a message with the URL)",
      });
      return;
    }

    function checkInstagram(url) {
      const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)/i;
      return igRegex.test(url);
    }
    if (!checkInstagram(url)) {
      await sock.sendMessage(msg.key.remoteJid, {text: "Invalid url"});
    }
    const res = await igdl(url);
    const data = res.data[0].url;
    await sock.sendMessage(msg.key.remoteJid, {video: {url: data}});
  },
};
