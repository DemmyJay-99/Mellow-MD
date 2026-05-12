export default {
  name: "vv",
  description: "Reveal a quoted view-once media",
  category: "Media",
  usage: "Reply to a view-once message with .vv || .vv me (to send to yourself)",
  execute: async (sock, msg, args) => {
    try {
      const remoteJid = msg.key.remoteJid;
      const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) {
        return sock.sendMessage(remoteJid, {
          text: "Reply to a view-once message with .vv",
        });
      }
      let actualMessage = quoted;

      if (quoted?.viewOnceMessage?.message) {
        actualMessage = quoted.viewOnceMessage.message;
      } else if (quoted?.viewOnceMessageV2?.message) {
        actualMessage = quoted.viewOnceMessageV2.message;
      } else if (quoted?.viewOnceMessageV2Extension?.message) {
        actualMessage = quoted.viewOnceMessageV2Extension.message;
      }

      const mediaType = Object.keys(actualMessage)[0];
      const media = actualMessage[mediaType];

      if (!media?.viewOnce) {
        return sock.sendMessage(remoteJid, {
          text: "Quoted message is not a view-once message.",
        });
      }

      const {downloadContentFromMessage} = await import("@innovatorssoft/baileys");

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
        return await sock.sendMessage(user, sendObject);
      }
      await sock.sendMessage(remoteJid, sendObject);
    } catch (err) {
      console.error("vv error:", err);
      sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Failed to reveal view-once.",
      });
    }
  },
};
