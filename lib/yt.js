import {execSync, spawn} from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const BIN_DIR = path.resolve("./bin");

function getPlatformBinaryName() {
  const platform = process.platform;
  switch (platform) {
    case "win32":
      return "yt-dlp.exe";
    case "darwin":
      return "yt-dlp_macos";
    case "android":
      return "yt-dlp_linux_aarch64";
    case "linux":
      return process.arch === "arm64" ? "yt-dlp_linux_aarch64" : "yt-dlp_linux";
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function getBinaryUrl(binaryName) {
  return `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;
}

function installYtDlp() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, {recursive: true});
  }

  const binaryName = getPlatformBinaryName();
  const binaryUrl = getBinaryUrl(binaryName);
  const YT_DLP_PATH = path.join(BIN_DIR, binaryName);

  if (!fs.existsSync(YT_DLP_PATH)) {
    if (process.platform === "win32") {
      // execSync(`curl -LsS ${binaryUrl} -o ${YT_DLP_PATH}`);
      spawn("curl", ["-LsS", binaryUrl, "-o", YT_DLP_PATH], {stdio: "inherit"});
    } else {
      // execSync(`curl -LsS ${binaryUrl} -o ${YT_DLP_PATH}`);
      spawn("curl", ["-LsS", binaryUrl, "-o", YT_DLP_PATH], {stdio: "inherit"});
      fs.chmodSync(YT_DLP_PATH, 0o755);
    }
  }
  return YT_DLP_PATH;
}

const YT_DLP_PATH = installYtDlp();

function writeEnv() {
  const COOKIE = process.env.YT_COOKIE;
  if (!COOKIE) {
    throw new Error(
      "YT_COOKIE environment variable is not set. " + 'Please export YT_COOKIE="your_cookies_here" before running.',
    );
  }
  const cookiesPath = path.join(os.tmpdir(), "cookies.txt");
  fs.writeFileSync(cookiesPath, COOKIE);
  return cookiesPath;
}

async function ytDlp(url, options = {}) {
  const {args = [], type = "video"} = options;
  const cookiesPath = writeEnv();
  if (type === "audio") {
    const finalArgs = [
      "-f",
      "bestaudio/best",
      "--cookies",
      cookiesPath,
      "--no-playlist",
      "--no-warnings",
      "--js-runtimes",
      "node",
      "--quiet",
      "-o",
      "-",
      "--playlist-items",
      "1",
      url,
      ...args,
    ];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          proc.kill();
          reject(new Error("yt-dlp timed out after 3 minutes"));
        },
        3 * 60 * 1000,
      );
      const proc = spawn(YT_DLP_PATH, finalArgs, {
        shell: false,
      });
      const chunks = [];
      let stderr = "";
      proc.stdout.on("data", (data) => {
        chunks.push(data);
      });
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        clearTimeout(timeout);
        try {
          if (fs.existsSync(cookiesPath)) {
            fs.unlinkSync(cookiesPath);
          }
        } catch (err) {
          // console.error('Failed to delete cookies file:', err);
        }
        if (stderr.includes("Sign in to confirm you’re not a bot")) {
          return reject(new Error("Sign in to confirm you’re not a bot\nUpdate YT_COOKIE env var"));
        }
        if (code === 0) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`yt-dlp exited with code ${code}\n${stderr}`));
        }
      });
      proc.on("error", (err) => {
        reject(err);
      });
    });
  } else if (type === "video") {
    const filename = `${Date.now()}`;
    const filepath = path.join(os.tmpdir(), filename);
    const finalArgs = [
      "-f",
      "sd/18/bestvideo[height<=720][vcodec*=h264]+bestaudio[acodec*=aac]/bestvideo[height<=720][vcodec*=h264]+bestaudio[acodec*=mp4a]/bestvideo[height<=720][vcodec*=h264]+bestaudio/bestvideo[height<=720]+bestaudio/bestvideo[vcodec*=h264]+bestaudio[acodec*=aac]/bestvideo[vcodec*=h264]+bestaudio[acodec*=mp4a]/bestvideo[vcodec*=h264]+bestaudio/bestvideo+bestaudio/best",
      "--cookies",
      cookiesPath,
      "--no-playlist",
      "--no-warnings",
      "--add-metadata",
      "--embed-chapters",
      "--js-runtimes",
      "node",
      "--quiet",
      "--merge-output-format",
      "mp4",
      "-o",
      `${filepath}.%(ext)s`,
      "--playlist-items",
      "1",
      url,
      ...args,
    ];
    return new Promise((resolve, reject) => {
      const proc = spawn(YT_DLP_PATH, finalArgs, {
        shell: false,
      });
      const timeout = setTimeout(
        () => {
          proc.kill();
          try {
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } catch (err) {
            // console.error('Failed to delete temp video file:', err);
          }
          reject(new Error("yt-dlp timed out after 5 minutes"));
        },
        5 * 60 * 1000,
      );
      let stderr = "";
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (code) => {
        clearTimeout(timeout);
        if (fs.existsSync(cookiesPath)) {
          fs.unlinkSync(cookiesPath);
        }
        if (stderr.includes("Sign in to confirm you’re not a bot")) {
          return reject(new Error("Sign in to confirm you’re not a bot\nUpdate YT_COOKIE env var"));
        }
        if (code === 0) {
          const files = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith(filename));
          const newPath = path.join(os.tmpdir(), files[0]);
          resolve(newPath);
        } else {
          try {
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } catch (err) {
            // console.error('Failed to delete temp video file:', err);
          }
          reject(new Error(`yt-dlp exited with code ${code}\n${stderr}`));
        }
      });
      proc.on("error", (err) => {
        clearTimeout(timeout);
        try {
          console.error("Error occurred while downloading video:");
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        } catch (err) {
          // console.error('Failed to delete temp video file:', err);
        }
        reject(err);
      });
    });
  } else if (type === "twitter") {
    const filename = `${Date.now()}`;
    const filepath = path.join(os.tmpdir(), filename);    const finalArgs = [
      "--merge-output-format",
      "mp4",
      "--no-playlist",
      "--no-warnings",
      "--add-metadata",
      "--embed-chapters",
      "--quiet",
      "--playlist-items",
      "1",
      "-o",
      `${filepath}.%(ext)s`,
      url,
      ...args,
    ];
    return new Promise((resolve, reject) => {
      const proc = spawn(YT_DLP_PATH, finalArgs, {
        shell: false,
      });
      const timeout = setTimeout(
        () => {
          proc.kill();
          reject(new Error("yt-dlp timed out after 5 minutes"));
        },
        5 * 60 * 1000,
      );
      let stderr = "";
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          const files = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith(filename));
          const newPath = path.join(os.tmpdir(), files[0]);
          resolve(newPath);
        } else {
          try{
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } catch (err) {
            // console.error('Failed to delete temp video file:', err);
          }
          reject(new Error(`yt-dlp exited with code ${code}\n${stderr}`));
        }
      });
      proc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
}

/**
 * Download audio from a YouTube URL and return it as a Buffer.
 * @param {String} url video url
 * @returns {Promise<Buffer>} audio buffer
 * @throws {Error} if yt-dlp fails or returns a non-zero exit code
 */

function ytAudio(url) {
  return ytDlp(url, {
    type: "audio",
  });
}

/**
 * Download video from a YouTube URL and return the file path.
 * @param {String} url video url
 * @returns {Promise<String>} file path
 * @throws {Error} if yt-dlp fails or returns a non-zero exit code
 */

function ytVideo(url) {
  return ytDlp(url, {
    type: "video",
  });
}

/**
 * Download video from a Twitter URL and return the file path.
 * @param {String} url video url
 * @returns {Promise<String>} file path
 * @throws {Error} if yt-dlp fails or returns a non-zero exit code
 */

function twitterVideo(url) {
  return ytDlp(url, {
    type: "twitter",
  });
}

export {installYtDlp, ytAudio, ytVideo, twitterVideo};