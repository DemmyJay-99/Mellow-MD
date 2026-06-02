import {execSync} from "child_process";
import axios from "axios";

const pullLatestUpdates = async () => {
  execSync("git pull", {stdio: "inherit"});
  const diff = execSync("git diff HEAD@{1} HEAD --name-only").toString();

  if (diff.includes("package.json") || diff.includes("yarn.lock")) {
    console.log("Dependencies changed. Installing...");
    execSync("yarn install --frozen-lockfile", {stdio: "inherit"});
    console.log("Dependencies installed successfully");
  }
};

const getLatestCommitMessages = async () => {
  const local = execSync("git rev-parse HEAD").toString().trim();
  const data = await axios.get(`https://api.github.com/repos/DemmyJay-99/Mellow-MD/compare/${local}...master`);
  const message = data.data.commits.map((commit) => `* ${commit.commit.message.split("\n")[0]}`);
  return {commitLength: message.length, commits: message.join("\n")};
};

export {
    pullLatestUpdates,
    getLatestCommitMessages,
}
