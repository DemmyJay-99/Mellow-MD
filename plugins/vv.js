export default {
    name: "vv",
    description: "Reveal a quoted view-once media",
    isPublic: false,
    execute: async (sock, msg, args) => {
        try {
            const remoteJid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) {
                return sock.sendMessage(remoteJid, {
                    text: "Reply to a view-once message with .vv"
                });
            }

            // Detect which media type we have
            const mediaType = Object.keys(quoted)[0];  
            const media = quoted[mediaType];

            // Check if it's actually view-once
            if (!media?.viewOnce) {
                return sock.sendMessage(remoteJid, {
                    text: "Quoted message is not a view-once message."
                });
            }

            // Import downloader
            const { downloadContentFromMessage } = await import("@whiskeysockets/baileys");

            // Determine type (image, video, audio, etc)
            const type = mediaType.replace("Message", "").toLowerCase();

            // Download stream
            const stream = await downloadContentFromMessage(media, type);

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Sending back the media
            const sendObject = {};

            if (type === "image") {
                sendObject.image = buffer;
                sendObject.caption = args.join(" ") || "";
            } else if (type === "video") {
                sendObject.video = buffer;
                sendObject.caption = args.join(" ") || "";
            } else if (type === "audio") {
                sendObject.audio = buffer;
            } else {
                // fallback to document
                sendObject.document = buffer;
                sendObject.fileName = "file";
            }

            await sock.sendMessage(remoteJid, sendObject);

        } catch (err) {
            console.error("vv error:", err);
            sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Failed to reveal view-once."
            });
        }
    }
};
