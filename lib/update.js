import { spawnSync } from "child_process";
import axios from "axios";

const pullLatestUpdates = async () => {
  spawnSync("git", ["pull"], { stdio: "inherit" });

  const diffResult = spawnSync("git", ["diff", "HEAD@{1}", "HEAD", "--name-only"], { stdio: "pipe", windowsHide: true, detached: true });
  const diff = diffResult.stdout.toString();

  if (diff.includes("package.json") || diff.includes("yarn.lock")) {
    console.log("Dependencies changed. Installing...");
    spawnSync("yarn", ["install", "--frozen-lockfile"], { stdio: "inherit", windowsHide: true, detached: true });
    console.log("Dependencies installed successfully");
  }
};

const getLocalCommitHash = () => {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { stdio: "pipe", windowsHide: true, detached: true });
  return result.stdout.toString().trim();
};

const getLatestCommitMessages = async () => {
  const local = getLocalCommitHash();
  const data = await axios.get(`https://api.github.com/repos/DemmyJay-99/Mellow-MD/compare/${local}...master`);
  const message = data.data.commits.map((commit) => `* ${commit.commit.message.split("\n")[0]}`);
  return { commitLength: message.length, commits: message.join("\n") };
};

const isUpdateAvailable = async () => {
  const local = getLocalCommitHash();
  const data = await axios.get(`https://api.github.com/repos/DemmyJay-99/Mellow-MD/compare/${local}...master`);
  return data.data.status === "ahead";
};

export {
  pullLatestUpdates,
  getLatestCommitMessages,
  isUpdateAvailable
};