import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

export default {
  name: "time",
  description: "Check the current time",
  category: "Utility",
  usage: "time",
  execute: async (sock, msg, args) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    let TZ;
    if(args[0]) {
      TZ = args[0];
    } else {
      TZ = process.env.TIMEZONE || "UTC";
    }
    const time = dayjs().tz(TZ).format("HH:mm:ss");
    await sock.sendMessage(msg.key.remoteJid, {text: `Time: ${time}`}, {quoted: msg});
  },
};
