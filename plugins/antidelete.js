import { readData, writeData, isJid } from "../lib/index.js";
import store from "../lib/store.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleMessageRevocation = async (sock, message) => {
  try {
    const antideleteConfig = await readData(path.join(__dirname, "../data/antidelete.json"));
    const action = antideleteConfig[0];
    if (!action || action === "off") {
      return;
    }
    const msgID = message.message.protocolMessage.key.id;
    console.log(`Message with ID ${msgID} has been revoked.`);
    const original = await store.getMessage(msgID);
    if (!original) {
      console.log(`Original message with ID ${msgID} not found in the database.`);
      return;
    }
    let jid;
    if (action === "me") {
      jid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    } else if (isJid(action)) {
      jid = action;
    }
    if (original.mediaType === "image") {
      const media = await store.getMedia(original);
      if (!media) {
        console.log(`Media for message ID ${msgID} not found.`);
        return;
      }
      await sock.sendMessage(
        jid,
        {
          image: media,
          caption: original.content || "",
        },
        { quoted: original },
      );
    } else if (original.mediaType === "video") {
      const media = await store.getMedia(original);
      if (!media) {
        console.log(`Media for message ID ${msgID} not found.`);
        return;
      }
      await sock.sendMessage(
        jid,
        {
          video: media,
          caption: original.content || "",
        },
        { quoted: original },
      );
    } else if (original.mediaType === "sticker") {
      const media = await store.getMedia(original);
      if (!media) {
        console.log(`Media for message ID ${msgID} not found.`);
        return;
      }
      await sock.sendMessage(
        jid,
        {
          sticker: media,
        },
        { quoted: original },
      );
    } else if (original.mediaType === "document") {
      const media = await store.getMedia(original);
      if (!media) {
        console.log(`Media for message ID ${msgID} not found.`);
        return;
      }
      await sock.sendMessage(
        jid,
        {
          document: media,
          caption: original.content || "",
          fileName: original.fileName,
          mimetype: original.mimeType,
        },
        { quoted: original },
      );
    } else if (original.mediaType === "audio") {
      const media = await store.getMedia(original);
      if (!media) {
        console.log(`Media for message ID ${msgID} not found.`);
        return;
      }
      await sock.sendMessage(
        jid,
        {
          audio: media,
          caption: original.content || "",
          ptt: original.audioPtt || false,
        },
        { quoted: original },
      );
    } else {
      await sock.sendMessage(
        jid,
        {
          text: original.content || "",
        },
        { quoted: original },
      );
    }
  } catch (error) {
    console.error("Error handling message revocation:", error);
  }
};

export default {
  name: "antidelete",
  description: "Prevents message deletion and notifies the user.",
  category: "utility",
  usage: "antidelete <me|jid|off>",
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID } = mellow;
    const action = args[0];
    if (!action) {
      return sock.sendMessage(chatID, {
        text: "Please provide an action: me, jid, or off.",
      });
    }
    if (action === "me") {
      await writeData([action], path.join(__dirname, "../data/antidelete.json"));
      return sock.sendMessage(chatID, {
        text: "Deleted messages will be sent to you.",
      });
    } else if (action === "off") {
      await writeData([action], path.join(__dirname, "../data/antidelete.json"));
      return sock.sendMessage(chatID, {
        text: "Antidelete feature has been turned off.",
      });
    } else if (isJid(action)) {
      await writeData([action], path.join(__dirname, "../data/antidelete.json"));
      return sock.sendMessage(chatID, {
        text: "Deleted messages will be sent to the specified JID.",
      });
    } else {
      return sock.sendMessage(chatID, {
        text: "Invalid action. Please use: me, jid, or off.",
      });
    }
  },
};
