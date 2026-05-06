import {fbdl} from "ruhend-scraper";

export default {
  name: "fb",
  description: "Download Facebook videos",
  category: "Downloaders",
  usage: "fb <fb URL> (or reply to a message with the URL)",
  execute: async (sock, msg, args, quotedMessage) => {
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text;
    }
    if (!url) {
      await sock.sendMessage(msg.key.remoteJid, {
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
      await sock.sendMessage(msg.key.remoteJid, {text: "Invalid url"});
      return;
    }
    const res = await fbdl(url);
    const video = res.data[0].url;
    await sock.sendMessage(msg.key.remoteJid, {video: {url: video}});
  },
};
