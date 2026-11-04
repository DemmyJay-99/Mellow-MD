import { galleryDL } from "../lib/gallery-dl.js";
import { gifToVideo } from "../lib/ffmpeg.js";
import { print } from "../lib/log.js";

export default {
  name: "gif",
  description: "Send GIFs",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID } = mellow;
    const last = Number(args.at(-1));
    const hasCount = Number.isInteger(last) && last > 0;
    const gifCount = hasCount ? last : 5;
    const gifName = (hasCount ? args.slice(0, -1) : args).join(" ");
    if (!gifName) {
      await sock.sendMessage(chatID, { text: "Please provide a search term" });
      return;
    }
    const url = `https://tenor.com/search/${encodeURIComponent(gifName)}`;

    try {
      const result = await galleryDL(url, {
        args: ["--range", `1-${Number(gifCount) || 3}`, "--get-urls"],
        type: "gif",
      });
      if (result?.length > 0) {
        let currentGif = 1;
        const msg = await sock.sendMessage(chatID, {
          text: `Sending ${currentGif}/${result.length} GIF${result.length === 1 ? "" : "s"}...`,
        });
        for (const url of result) {
          currentGif++;
          const res = await fetch(url);
          if (!res.ok) continue;
          const gifBuffer = await res.arrayBuffer();
          const input = Buffer.from(gifBuffer);
          const video = await gifToVideo(input, "mp4");
          await sock.sendMessage(chatID, { video, gifPlayback: true });
          await sock.sendMessage(chatID, {
            text:
              currentGif > result.length
                ? `Sent ${result.length} GIF${result.length === 1 ? "" : "s"}.`
                : `Sending ${currentGif}/${result.length} GIF${result.length === 1 ? "" : "s"}...`,
            edit: msg.key,
          });
        }
      } else {
        await sock.sendMessage(chatID, { text: "No GIFs found" });
      }
    } catch (error) {
      print("error", "Failed to fetch GIF:" + error.message);
    }
  },
};
