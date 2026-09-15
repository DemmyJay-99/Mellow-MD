import { isSenderAdmin } from "../lib/index.js";

export default {
  name: "mute",
  description: "Mute the group",
  category: "Group",
  aliases: ["silence"],
  usage: "mute <user>",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, senderID, botID, chatIDisGroup } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, { text: "This command only works in groups." });
    }
    const senderIsAdmin = await isSenderAdmin(sock, senderID, chatID);
    if (!senderIsAdmin) {
      return sock.sendMessage(chatID, { text: "You are not an admin." });
    }
    const botIsAdmin = await isSenderAdmin(sock, botID, chatID);
    if (!botIsAdmin) {
      return sock.sendMessage(chatID, { text: "Bot is not an admin." });
    }
    const durationInMinutes = args[0] ? parseInt(args[0]) : undefined;
    try {
      await sock.groupSettingUpdate(chatID, "announcement");
      if (durationInMinutes !== undefined && durationInMinutes > 0) {
        const durationInMilliseconds = durationInMinutes * 60 * 1000;
        await sock.sendMessage(chatID, {
          text: `The group has been muted for ${durationInMinutes} minutes.`,
        });

        setTimeout(async () => {
          try {
            await sock.groupSettingUpdate(chatID, "not_announcement");
            await sock.sendMessage(chatID, {
              text: "The group has been unmuted.",
            });
          } catch (unmuteError) {
            console.error("Error unmuting group:", unmuteError);
          }
        }, durationInMilliseconds);
      } else {
        await sock.sendMessage(chatID, {
          text: "The group has been muted.",
        });
      }
    } catch (error) {
      console.error("Error muting/unmuting the group:", error);
      await sock.sendMessage(chatID, {
        text: "An error occurred while muting/unmuting the group. Please try again.",
      });
    }
  },
};
