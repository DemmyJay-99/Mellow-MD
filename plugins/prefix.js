import { setvar } from "../lib/index.js";
import { print } from "../lib/log.js";

export default {
  name: "prefix",
  description: "Set bot prefix",
  usage: "prefix <new prefix>",
  category: "Owner",
  ownerOnly: true,
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID } = mellow;
    const prefixes = args;
    try {
      await setvar("PREFIX", prefixes.join(","));
      return await sock.sendMessage(chatID, {text: `Set prefix to "${prefixes.join(",")}"`})
    } catch (e) {
      print("error", e.message);
    }
  },
};
