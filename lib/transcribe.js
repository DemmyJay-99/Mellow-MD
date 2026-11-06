import Groq from "groq-sdk";
import { pipeline } from "stream/promises";
import os from "os";
import path from "path";
import fs from "fs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function transcribeAudio(stream) {
  const file = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);
  await pipeline(stream, fs.createWriteStream(file));
  const transcript = await groq.audio.transcriptions.create({
    file: fs.createReadStream(file),
    model: "whisper-large-v3",
    response_format: "text",
  });
  return transcript;
}
