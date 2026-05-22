import {execSync} from "child_process";
import axios from "axios";
import {generateQuickReplyButtons} from "@innovatorssoft/baileys";
import isSudo from "../lib/isSudo.js";
import normaliseLid from "../lib/normaliseLid.js";
import clearReact from "../lib/clearReact.js";

export default {
  name: "update",
  description: "Update the bot",
  category: "Bot",
  usage: "update(to check for updates), update now (to update immediately)",
  execute: async (sock, msg, args) => {
    try {
      execSync("git fetch", {stdio: "ignore"});
      if (args[0] === "now") {
        const local = execSync("git rev-parse HEAD").toString().trim();
        const remote = execSync("git rev-parse origin/master").toString().trim();
        console.log("Updating...");
        if (local !== remote) {
          console.log("Your version of mellow-md is outdated");
          execSync("git pull", {stdio: "inherit"});
          const diff = execSync("git diff HEAD@{1} HEAD --name-only").toString();

          if (diff.includes("package.json") || diff.includes("yarn.lock")) {
            console.log("Dependencies changed. Installing...");
            execSync("yarn install --frozen-lockfile", {stdio: "inherit"});
            console.log("Dependencies installed successfully");
          }
          console.log("Updated successfully. Restarting...");
          await sock.sendMessage(msg.key.remoteJid, {
            text: "Updated successfully. Restarting...",
          });
          await clearReact(sock, msg);
          setTimeout(() => {
            process.exit(0);
          }, 1500);
        } else {
          console.log("No updates found");
          await sock.sendMessage(msg.key.remoteJid, {
            text: "No updates found",
          });
          return;
        }
      } else {
        const local = execSync("git rev-parse HEAD").toString().trim();
        const remote = execSync("git rev-parse origin/master").toString().trim();
        const data = await axios.get(`https://api.github.com/repos/DemmyJay-99/Mellow-MD/compare/${local}...master`);
        const message = data.data.commits.map((commit) => `* ${commit.commit.message.split("\n")[0]}`);
        const commitLength = message.length;
        const commitMessage =
          `Missing ${commitLength} updates\n` +
          message.join("\n") +
          "\n" +
          "*Tap the button below to update (or use update now command)*";
        const buttons = generateQuickReplyButtons(
          commitMessage,
          [{displayText: "Update now", id: "update now"}],
          "Update now",
        );
        if (local !== remote) {
          console.log("Your version of mellow-md is outdated");
          await sock.sendMessage(msg.key.remoteJid, buttons);
        } else {
          await sock.sendMessage(msg.key.remoteJid, {
            text: "No updates found",
          });
          return;
        }
      }
    } catch (e) {
      console.log("Error checking for updates:", e.message);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Error checking for updates: " + e.message,
      });
    }
  },
  onMessage: async (sock, msg) => {
    const remoteJid = msg.key.participant || msg.key.remoteJid;
    let newJid;
    if (remoteJid.endsWith("@lid")) {
      newJid = await normaliseLid(sock, remoteJid);
    } else {
      newJid = remoteJid.split("@")[0];
    }
    const fromMe = msg.key.fromMe;
    const isSudoUser = await isSudo(newJid);
    if (fromMe || isSudoUser) {
    } else {
      return;
    }
    // if (!msg.key.fromMe || !await isSudo(newJid)) return;
    if (msg.message.templateButtonReplyMessage?.selectedId === "update now") {
      execSync("git pull", {stdio: "inherit"});
      const diff = execSync("git diff HEAD@{1} HEAD --name-only").toString();
      if (diff.includes("package.json") || diff.includes("yarn.lock")) {
        console.log("Dependencies changed. Installing...");
        execSync("yarn install --frozen-lockfile", {stdio: "inherit"});
        console.log("Dependencies installed successfully");
      }
      console.log("Updated successfully. Restarting...");
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Updated successfully. Restarting...",
      });
      await clearReact(sock, msg);
      setTimeout(() => {
        process.exit(0);
      }, 1500);
    }
  },
};
