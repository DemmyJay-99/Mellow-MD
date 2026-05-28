import {execSync} from "child_process";
import {generateQuickReplyButtons} from "@innovatorssoft/baileys";
import {getLatestCommitMessages, pullLatestUpdates} from "../lib/update.js";
import { clearReact } from "../lib/index.js";
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
          await pullLatestUpdates();
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
        const {commitLength, commits} = await getLatestCommitMessages();
        const commitMessage =
          `Missing ${commitLength} updates\n` +
          commits +
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
};
