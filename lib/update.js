import { exec } from "child_process";
import simpleGit from "simple-git";
import { promisify } from "util";
import { print } from "./log.js";
import axios from "axios";

const git = simpleGit();
const execAsync = promisify(exec);

const pullLatestUpdates = async () => {
  const oldCommit = await git.revparse(["HEAD"]);
  await git.pull();

  const newCommit = await git.revparse(["HEAD"]);

  if (oldCommit === newCommit) {
    print("info", "No updates available");
    return { updated: false };
  }

  const diff = await git.diff([oldCommit, newCommit, "--name-only"]);

  if (diff.includes("package.json") || diff.includes("yarn.lock")) {
    print("info", "Dependencies changed. Installing...");
    await execAsync("yarn install --frozen-lockfile");
    print("info", "Dependencies installed successfully");
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
  await git.fetch("origin");

  const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
  const local = await git.revparse(["HEAD"]);
  const remote = `origin/${branch}`;

  const commits = await git.log({
    from: local,
    to: remote,
  });

  return {
    available: commits.total > 0,
    commitLength: commits.total,
    commits: commits.all
      .map(c => `* ${c.message.split("\n")[0]}`)
      .join("\n"),
  };
};

export { pullLatestUpdates, getLocalCommitHash, checkForUpdates };
