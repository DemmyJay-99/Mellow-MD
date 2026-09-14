import config from "../config.js";

export default {
  name: "aza",
  description: "Send bank account details",
  category: "Owner",
  usage: ".aza",
  aliases: ["bank", "bankinfo", "bankdetails"],
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID } = mellow;
    const { bank, number, AccName } = config.aza;
    const text =
      `╭━━━━━━━━━━━━━━━━━━━╮\n` +
      `┃  *BANK INFO*\n` +
      `┣━━━━━━━━━━━━━━━━\n` +
      `┃★*Bank*: ${bank}\n` +
      `┃★*Acc*: ${number}\n` +
      `┃★*Name*: ${AccName}    \n` +
      `╰━━━━━━━━━━━━━━━━╯`;
    await sock.sendMessage(chatID, { text });
  },
};
