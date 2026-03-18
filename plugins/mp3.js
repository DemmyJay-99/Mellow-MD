import { toAudio } from "../lib/ffmpeg.js";
export default {
    name: "mp3",
    description: "Convert video to MP3",
    isPublic: false,
    category: "Media",
    execute: async (sock, msg, args, quotedMessage) => {
        try {
            const mediaMessage =
                quotedMessage?.videoMessage || quotedMessage?.documentMessage;
            if (!mediaMessage) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: "Reply to a video or document message.",
                });
            }
            const { downloadContentFromMessage } = await import(
                "@whiskeysockets/baileys"
            );
            const stream = await downloadContentFromMessage(
                mediaMessage,
                "video",
            );
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            const audioBuffer = await toAudio(
                buffer,
                mediaMessage.mimetype.split("/")[1],
            );
            await sock.sendMessage(
                msg.key.remoteJid,
                { audio: audioBuffer, mimetype: "audio/mpeg" },
                { quoted: msg },
            );
        } catch (e) {
            console.error("tomp3 error:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "Conversion to MP3 failed.",
            });
        }
    },
};
