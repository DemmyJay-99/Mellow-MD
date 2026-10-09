import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function ffmpeg(buffer, args = [], ext = "", ext2 = "") {
  const tempDir = path.join(__dirname, "../temp");
  await fs.promises.mkdir(tempDir, { recursive: true }); // no existsSync needed

  const tmp = path.join(tempDir, `${Date.now()}.${ext}`);
  const out = `${tmp}.${ext2}`;

  try {
    await fs.promises.writeFile(tmp, buffer);

    await new Promise((resolve, reject) => {
      spawn("ffmpeg", ["-y", "-i", tmp, ...args, out])
        .on("error", reject)
        .on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))));
    });

    return await fs.promises.readFile(out);
  } finally {
    // runs on success AND failure
    // await fs.promises.rm(tmp, { force: true });
    // await fs.promises.rm(out, { force: true });
  }
}

/**
 *
 * @param {Buffer} buffer Audio/video buffer
 * @param {String} ext File extension of the input buffer (e.g., "mp4", "mkv")
 * @returns {Promise<Buffer>} Reversed audio buffer in mp3 format
 * @throws {Error} if ffmpeg fails or returns a non-zero exit code
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"], ext, "mp3");
}

/**
 *
 * @param {Buffer} buffer Audio buffer
 * @param {String} ext File extension of the input buffer (e.g., "mp3", "wav")
 * @returns {Promise<Buffer>} Reversed audio buffer in mp3 format
 * @throws {Error} if ffmpeg fails or returns a non-zero exit code
 */

function reverseAudio(buffer, ext) {
  return ffmpeg(buffer, ["-af", "areverse"], ext, "mp3");
}

/**
 *
 * @param {Buffer} buffer Video buffer
 * @param {String} ext File extension of the input buffer (e.g., "mp4", "mkv")
 * @returns {Promise<Buffer>} Reversed video buffer in mp4 format
 * @throws {Error} if ffmpeg fails or returns a non-zero exit code
 */

function reverseVideo(buffer, ext) {
  return ffmpeg(buffer, ["-vf", "reverse", "-af", "areverse"], ext, "mp4");
}

/**
 *
 * @param {Buffer} buffer Video buffer
 * @param {String} ext  File extension of the input buffer (e.g., "mp4", "mkv")
 * @returns {Promise<Buffer>} Converted video buffer in mp4 format
 * @throws {Error} if ffmpeg fails or returns a non-zero exit code
 */

function toVideo(buffer, ext) {
  return ffmpeg(
    buffer,
    [
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "28",
      "-pix_fmt",
      "yuv420p",

      "-c:a",
      "aac",
      "-b:a",
      "96k",

      "-movflags",
      "+faststart",
    ],
    ext,
    "mp4",
  );
}

/**
 *
 * @param {Buffer} buffer Video buffer
 * @returns {Promise<Number>} Duration of the video in seconds
 * @throws {Error} if ffprobe fails or returns a non-zero exit code
 */

async function getDurationFromFile(buffer) {
  const dir = path.join(__dirname, "../temp");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, Date.now() + ".mp4");

  fs.writeFileSync(filePath, buffer);

  try {
    const output = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`);
    return parseFloat(output.toString());
  } catch {
    return 0;
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
function trimVideo(buffer, ext, start, duration) {
  return ffmpeg(
    buffer,
    [
      "-ss",
      start.toString(),
      "-t",
      duration.toString(),

      "-an",
      "-sn",
      "-dn",

      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "30",
      "-tune",
      "fastdecode",

      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
      "-pix_fmt",
      "yuv420p",
    ],
    ext,
    "mp4",
  );
}
export { toAudio, getDurationFromFile, reverseAudio, reverseVideo, toVideo, trimVideo };
