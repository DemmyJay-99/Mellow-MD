import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { explicitLog, print } from "./log.js";

const BIN_DIR = path.resolve("./bin");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGalleryDlPlatformBinaryName() {
  const platform = process.platform;
  switch (platform) {
    case "win32":
      return "gallery-dl.exe";
    case "darwin":
      return "gallery-dl.bin";
    case "android":
      return "gallery-dl.bin";
    case "linux":
      return "gallery-dl.bin";
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

const GALLERY_DL_PATH = path.join(BIN_DIR, getGalleryDlPlatformBinaryName());

/**
 * 
 * @param {String} url 
 * @param {Object} options 
 * @returns {Promise<string | string[]>}
 */

export const galleryDL = async (url, options = {}) => {
  if (!fs.existsSync(GALLERY_DL_PATH)) {
    throw new Error("gallery-dl was not installed. Run yarn install again.");
  }
  const { args = [], type = "video" } = options;
  const cookiesPath = path.join(__dirname, "../", "cookies.txt");
  if (!fs.existsSync(cookiesPath)) {
    print("warning", "No cookies.txt found. Some sites may require authentication.");
  }
  const filepath = path.join(__dirname, "../", "tmp", "download", `${Date.now()}`);
  if (!fs.existsSync(path.dirname(filepath))) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
  }
  const finalArgs = [...args, "--cookies", cookiesPath, "-D", filepath, url];
  return new Promise((resolve, reject) => {
    const proc = spawn(GALLERY_DL_PATH, finalArgs);
    const timeout = setTimeout(
      () => {
        proc.kill();
        try {
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        } catch (err) {
          console.error("Failed to delete temp video file:", err);
        }
        reject(new Error("gallery-dl timed out after 5 minutes"));
      },
      5 * 60 * 1000,
    );
    let stderr = "";
    let stdout = "";
    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      explicitLog(data.toString());
    });
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
      print("error", data.toString());
    });
    if (stderr.includes("No results for ")) {
      reject(new Error("No results found for this URL"));
    } else if (stderr.includes("HTTP redirect to login page")) {
      reject(new Error("Authentication required. Please check your cookies.txt"));
    }
    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        if (type === "video") {
          resolve(filepath);
        } else{
          resolve(stdout.trim().split(/\r?\n/).filter(Boolean));
        }
      } else {
        reject(new Error(`gallery-dl exited with code ${code}`));
      }
    });
    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

// const downloadPath = await galleryDL("https://www.tiktok.com/@honored_onee/video/7691054300117650721?is_from_webapp=1&sender_device=pc", { type: "twitter" });
// print("info", `Downloaded to: ${downloadPath}`);
