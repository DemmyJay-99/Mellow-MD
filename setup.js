import { execSync } from "child_process";
import fs from "fs";
import path from "path";

try {
  import("sharp");
} catch (e) {
  execSync("yarn add --ignore-engines sharp@0.34.5", { stdio: "inherit" });
}
try {
  execSync("patch-package", { stdio: "inherit" });
} catch (e) {
  process.exit(1);
}
const BIN_DIR = path.resolve("./bin");
fs.mkdirSync(BIN_DIR, { recursive: true });

function getYtDlpPlatformBinaryName() {
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

function getBinaryUrl(baseUrl, binaryName) {
  return `${baseUrl}/${binaryName}`;
}

function installYtDlp() {
  const binaryName = getYtDlpPlatformBinaryName();
  const binaryUrl = getBinaryUrl("https://github.com/yt-dlp/yt-dlp/releases/latest/download", binaryName);
  const YT_DLP_PATH = path.join(BIN_DIR, binaryName);

  if (!fs.existsSync(YT_DLP_PATH)) {
    execSync(`curl -LsS ${binaryUrl} -o ${YT_DLP_PATH}`, { stdio: "inherit" });
    if (process.platform !== "win32") {
      fs.chmodSync(YT_DLP_PATH, 0o755);
    }
  }

  return YT_DLP_PATH;
}

async function installGalleryDL() {
  const binaryName = getGalleryDlPlatformBinaryName();
  const response = await fetch("https://codeberg.org/api/v1/repos/mikf/gallery-dl/releases/latest");

  if (!response.ok) {
    throw new Error(`Codeberg API returned ${response.status}`);
  }

  const release = await response.json();
  const asset = release.assets.find((a) => a.name === binaryName);
  if (!asset) {
    throw new Error(`Could not find asset ${binaryName} in release`);
  }
  const binaryUrl = asset.browser_download_url;
  const GALLERY_DL_PATH = path.join(BIN_DIR, binaryName);

  if (!fs.existsSync(GALLERY_DL_PATH)) {
    execSync(`curl -LsS ${binaryUrl} -o ${GALLERY_DL_PATH}`, { stdio: "inherit" });
    if (process.platform !== "win32") {
      fs.chmodSync(GALLERY_DL_PATH, 0o755);
    }
  }

  return GALLERY_DL_PATH;
}

installYtDlp();
installGalleryDL().catch((err) => {
  console.error("Failed to install gallery-dl:", err);
  process.exit(1);
});
