export default {
  name: "tomp3",
  description: "Convert video to MP3",
  isPublic: false,
  category: "Media",
    execute: async (sock, msg, args, quotedMessage) => {
        try {
            const mediaMessage = quotedMessage?.message?.videoMessage || quotedMessage?.message?.documentMessage;
            if (!mediaMessage) {
                return sock.sendMessage(msg.key.remoteJid, { text: "Reply to a video or document message." });
            }
            const buffer = await sock.downloadMediaMessage(quotedMessage);
            const audioBuffer = await toAudio(buffer, mediaMessage.mimetype.split('/')[1]);
            await sock.sendMessage(msg.key.remoteJid, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: msg });
        } catch (e) {
            console.error("tomp3 error:", e);
            await sock.sendMessage(msg.key.remoteJid, { text: "Failed to convert to MP3." });
        }
        
}