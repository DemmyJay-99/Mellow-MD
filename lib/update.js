import { exec } from "child_process";
import simpleGit from "simple-git";
import { promisify } from "util";
import axios from "axios";

const git = simpleGit();
const execAsync = promisify(exec);

const pullLatestUpdates = async () => {
  const oldCommit = await git.revparse(["HEAD"]);
  await git.pull();

  const newCommit = await git.revparse(["HEAD"]);

  if (oldCommit === newCommit) {
    console.log("No updates available.");
    return { updated: false };
  }

  const diff = await git.diff([oldCommit, newCommit, "--name-only"]);

  if (diff.includes("package.json") || diff.includes("yarn.lock")) {
    console.log("Dependencies changed. Installing...");
    await execAsync("yarn install --frozen-lockfile");
    console.log("Dependencies installed successfully");
  }
  return { updated: true };
};

const getLocalCommitHash = async () => {
  return await git.revparse(["HEAD"]);
};

const getCurrentBranch = async () => {
  return (await git.branch()).current;
};

const checkForUpdates = async () => {
  const local = await getLocalCommitHash();
  const branch = await getCurrentBranch();
  const { data } = await axios.get(`https://api.github.com/repos/DemmyJay-99/Mellow-MD/compare/${local}...${branch}`);
  const commits = data.commits.map((c) => `* ${c.commit.message.split("\n")[0]}`);
  return {
    available: data.status === "behind",
    commitLength: commits.length,
    commits: commits.join("\n"),
  };
};

export { pullLatestUpdates, getLocalCommitHash, checkForUpdates };
