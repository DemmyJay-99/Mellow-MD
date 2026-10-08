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
  const binaryName = getPlatformBinaryName();
  const binaryUrl = getBinaryUrl(binaryName);
  const YT_DLP_PATH = path.join(BIN_DIR, binaryName);

  if (!fs.existsSync(YT_DLP_PATH)) {
    execSync(`curl -LsS binaryUrl -o ${YT_DLP_PATH}`, { stdio: "inherit" });

    if (process.platform !== "win32") {
      fs.chmodSync(YT_DLP_PATH, 0o755);
    }
  }

  return YT_DLP_PATH;
}

installYtDlp();
