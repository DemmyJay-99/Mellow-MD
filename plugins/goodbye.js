import { isGoodbyeOn, setGoodbye, isSenderAdmin } from "../lib/index.js";

export const handleGoodbyeEvent = async (sock, chatID, participants) => {
  const isGoodByeEnabled = await isGoodbyeOn(chatID);
  if (!isGoodByeEnabled) return;
  const metadata = await sock.groupMetadata(chatID);
  const groupName = metadata.subject || "this group";
  for (const participant of participants) {
    const goodbyeMessage = `@${participant.id.split("@")[0]} left ${groupName}!\n`;
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
      caption: goodbyeMessage,
      mentions: [participant.id],
    });
  }
};

export default {
  name: "goodbye",
  description: "Toggle goodbye messages for leaving group members",
  category: "Group",
  usage: "goodbye <on|off>",
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
        text: "Usage: goodbye <on|off>",
      });
    }
    const enabled = action === "on";
    await setGoodbye(chatID, enabled);
    await sock.sendMessage(chatID, {
      text: `Goodbye messages have been ${enabled ? "enabled" : "disabled"}.`,
    });
  },
};
