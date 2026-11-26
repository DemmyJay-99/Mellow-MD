import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { explicitLog } from "./log.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { randomBytes } from "crypto";

async function ffmpeg(buffer, args = [], ext = "", ext2 = "") {
  const tempDir = path.join(__dirname, "../temp");
  await fs.promises.mkdir(tempDir, { recursive: true });

  const tmp = path.join(tempDir, `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`);
  const out = `${tmp}.${ext2}`;

  try {
    await fs.promises.writeFile(tmp, buffer);

    await new Promise((resolve, reject) => {
      const ff = spawn("ffmpeg", ["-y", "-i", tmp, ...args, out]);
      let stderr = "";
      ff.stderr.on("data", (d) => (stderr += d.toString()));
      ff.on("error", reject);
      ff.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}\n${stderr.slice(-500)}`)),
      );
    });

    return await fs.promises.readFile(out);
  } finally {
    await fs.promises.rm(tmp, { force: true });
    await fs.promises.rm(out, { force: true });
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
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
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
 * @param {Buffer} buffer GIF buffer
 * @param {String} ext File extension of the input buffer (e.g., "gif")
 * @returns {Promise<Buffer>} Converted video buffer in mp4 format
 * @throws {Error} if ffmpeg fails or returns a non-zero exit code
 */

function gifToVideo(buffer, ext) {
  return ffmpeg(
    buffer,
    ["-movflags", "+faststart", "-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2"],
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
import { execFile } from "node:child_process";

const hasAudio = (path) =>
  new Promise((resolve, reject) => {
    execFile(
      "ffprobe",
      ["-v", "error", "-show_streams", "-select_streams", "a", "-of", "json", path],
      (error, stdout) => {
        if (error) return reject(error);

        try {
          const metadata = JSON.parse(stdout);
          resolve(metadata.streams.length > 0);
        } catch (error) {
          reject(error);
        }
      },
    );
  });

const toOpus = (buffer, seconds, ext = "mp4") => {
  const args = [
    "-vn",
    "-map_metadata", "-1",
    "-c:a", "libopus",
    "-ac", "1",
    "-ar", "48000",
    "-b:a", "64k",
    "-f", "ogg",
  ];

  if (seconds) args.push("-t", String(seconds));

  return ffmpeg(buffer, args, ext, "ogg");
};

const MAX_STICKER_BYTES = 900 * 1024;

const videoToWebp = async (videoBuffer, seconds) => {
  const attempts = [
    { fps: 15, q: 50 },
    { fps: 12, q: 40 },
    { fps: 10, q: 30 },
    { fps: 8, q: 20 },
  ];

  let webp;
  for (const { fps, q } of attempts) {
    webp = await ffmpeg(
      videoBuffer,
      [
        "-t", String(seconds),
        "-vf",
        `fps=${fps},scale=512:512:force_original_aspect_ratio=decrease,format=rgba,` +
          `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
        "-c:v", "libwebp",
        "-loop", "0",
        "-an",
        "-q:v", String(q),
        "-compression_level", "6",
      ],
      "mp4",
      "webp",
    );
    if (webp.length <= MAX_STICKER_BYTES) break;
  }
  return webp;
};

export { toAudio, getDurationFromFile, reverseAudio, reverseVideo, toVideo, trimVideo, gifToVideo, hasAudio, toOpus, videoToWebp };
