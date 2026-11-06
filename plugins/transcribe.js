import { transcribeAudio } from "../lib/transcribe.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
export default {
  name: 'transcribe',
  description: 'Transcribes audio files using OpenAI Whisper API',
  execute: async (sock, msg, args, mellow = {}) => {
    const { chatID, quotedMessage } = mellow;
    const audioMessage = quotedMessage?.audioMessage;
    if(!audioMessage) {
      return await sock.sendMessage(chatID, { text: 'Please reply to an audio message to transcribe.' });
    }
    try {
      const stream = await downloadContentFromMessage(audioMessage, "audio");
      const transcript = await transcribeAudio(stream);
      await sock.sendMessage(chatID, { text: transcript });
    } catch (error) {
      console.error('Transcription error:', error);
      await sock.sendMessage(chatID, { text: 'Sorry, an error occurred while transcribing the audio.' });
    }
  }
}