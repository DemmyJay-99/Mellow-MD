import { hasSeenMessage, markMessageSeen } from "./store.js";
import handleCommand from "./commandHandler.js";

const handleMessage = async (sock, message) => {
  const { messages, type } = message;
  if (type !== "notify") return;
  const msg = messages[0];
  if (!msg || !msg.message) return;
  const msgID = msg.key.id;
  if (hasSeenMessage(msgID)) {
    return;
  }

  try {
    await handleCommand(sock, msg);
    markMessageSeen(msgID);
  } catch (error) {
    console.error("Error in message handler:", error);
  }
};

export default handleMessage;
