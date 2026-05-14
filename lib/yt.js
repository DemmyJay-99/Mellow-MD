import {execSync, spawn} from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const BIN_DIR = path.resolve("./bin");
const YT_DLP_PATH = path.join(BIN_DIR, "yt-dlp");
function installYtDlp() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, {recursive: true});
  }

  if (!fs.existsSync(YT_DLP_PATH)) {
    execSync(`curl -LsS https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o ${YT_DLP_PATH}`);
    fs.chmodSync(YT_DLP_PATH, 0o755);
  }
}

installYtDlp()

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
      "-o",
      "-",
      '--playlist-items',
      '1',
      url,
      ...args,
    ];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          proc.kill();
          reject(new Error("yt-dlp timed out after 5 minutes"));
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
          fs.unlinkSync(cookiesPath);
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
  }
}

function ytAudio(url) {
  return ytDlp(url, {
    type: "audio",
  });
}

export {installYtDlp, ytAudio};
