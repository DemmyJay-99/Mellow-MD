import {ttdl} from "ruhend-scraper";

export default {
  name: "tiktok",
  description: "Download Tiktok videos",
  isPublic: false,
  category: "Downloaders",
  usage: "tiktok <TikTok URL> (or reply to a message with the URL)",
  execute: async (sock, msg, args, quotedMessage) => {
    let url;
    if (args[0]) {
      url = args[0];
    } else if (quotedMessage) {
      url = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text;
    }
    if (!url) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Usage: tiktok <TikTok URL> (or reply to a message with the URL)",
      });
      return;
    }
    function isTikTokUrlRegex(url) {
      const tiktokRegex = new RegExp(/https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/(@[\w.-]+\/video\/(\d+)|[\w.-]+)/i);
      return tiktokRegex.test(url);
    }
    if (!isTikTokUrlRegex(url)) {
      await sock.sendMessage(msg.key.remoteJid, {text: "Invalid url"});
      return;
    }
    let {video} = await ttdl(url);
    await sock.sendMessage(msg.key.remoteJid, {video: {url: video}, mimetype: "video/mp4", hd: true}, {quoted: msg});
  },
};
