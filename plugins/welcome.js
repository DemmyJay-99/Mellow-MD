import { setWelcome, isSenderAdmin, isWelcomeOn } from "../lib/index.js";

export const handleWelcomeEvent = async (sock, chatID, participants) => {
  const isWelcomeEnabled = await isWelcomeOn(chatID);
  if (!isWelcomeEnabled) return;
  const metadata = await sock.groupMetadata(chatID);
  const groupName = metadata.subject || "this group";

  for (const participant of participants) {
    const welcomeMessage = `Welcome @${participant.id.split("@")[0]} to ${groupName}!\n`;
    let profilePictureUrl;
    try {
      const profilePicture = await sock.profilePictureUrl(participant.id);
      profilePictureUrl = profilePicture;
    } catch (error) {
      console.error(`Could not fetch profile picture for ${participant.id}:`, error);
      profilePictureUrl = "https://i.ibb.co/sdvxvbS2/wanderercreative-blank-profile-picture-973460-640.jpg"; // Fallback if profile picture is not available
    }
    await sock.sendMessage(chatID, {
      image: { url: profilePictureUrl },
      caption: welcomeMessage,
      mentions: [participant.id],
    });
  }
};

export default {
  name: "welcome",
  description: "Toggle welcome messages for new group members",
  category: "Group",
  usage: "welcome <on|off>",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, chatIDisGroup, senderID } = mellow;
    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }
    const isAdmin = await isSenderAdmin(sock, senderID, chatID);
    if (!isAdmin) {
      return sock.sendMessage(chatID, {
        text: "You are not an admin.",
      });
    }
    const action = args[0]?.toLowerCase();
    if (!action || !["on", "off"].includes(action)) {
      return sock.sendMessage(chatID, {
        text: "Usage: welcome <on|off>",
      });
    }
    const enabled = action === "on";
    await setWelcome(chatID, enabled);
    await sock.sendMessage(chatID, {
      text: `Welcome messages have been ${enabled ? "enabled" : "disabled"}.`,
    });
  },
};
