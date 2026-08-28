export default {
  name: "vv",
  description: "Reveal a quoted view-once media",
  category: "Media",
  usage: "Reply to a view-once message with .vv || .vv me (to send to yourself)",
  execute: async (sock, msg, args, mellow = {}) => {
    try {
      const {chatID, quotedMessage, botID} = mellow;

      if (!quotedMessage) {
        return sock.sendMessage(chatID, {
          text: "Reply to a view-once message with .vv",
        });
      }
      let actualMessage = quotedMessage;

      if (quotedMessage?.viewOnceMessage?.message) {
        actualMessage = quotedMessage.viewOnceMessage.message;
      } else if (quotedMessage?.viewOnceMessageV2?.message) {
        actualMessage = quotedMessage.viewOnceMessageV2.message;
      } else if (quotedMessage?.viewOnceMessageV2Extension?.message) {
        actualMessage = quotedMessage.viewOnceMessageV2Extension.message;
      }

      const mediaType = Object.keys(actualMessage)[0];
      const media = actualMessage[mediaType];

      if (!media?.viewOnce) {
        return sock.sendMessage(chatID, {
          text: "Quoted message is not a view-once message.",
        });
      }

      const {downloadContentFromMessage} = await import("@whiskeysockets/baileys");

      const type = mediaType.replace("Message", "").toLowerCase();

      const stream = await downloadContentFromMessage(media, type);

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const sendObject = {};

      if (type === "image") {
        sendObject.image = buffer;
        sendObject.caption = media.caption || "";
      } else if (type === "video") {
        sendObject.video = buffer;
        sendObject.caption = media.caption || "";
      } else if (type === "audio") {
        sendObject.audio = buffer;
        sendObject.mimetype = media.mimetype || "audio/ogg; codecs=opus";
        sendObject.ptt = media.ptt || false;
      } else {
        sendObject.document = buffer;
        sendObject.fileName = "file";
      }
      if (args[0] === "me") {
        return await sock.sendMessage(botID, sendObject);
      }
      await sock.sendMessage(chatID, sendObject);
    } catch (err) {
      console.error("vv error:", err);
      sock.sendMessage(chatID, {
        text: "❌ Failed to reveal view-once.",
      });
    }
  },
};
