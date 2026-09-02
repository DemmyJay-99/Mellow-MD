import { pullLatestUpdates, checkForUpdates } from "../lib/update.js";
import { clearReact } from "../lib/index.js";
export default {
  name: "update",
  description: "Update the bot",
  category: "Bot",
  usage: "update(to check for updates), update now (to update immediately)",
  execute: async (sock, msg, args) => {
    try {
      if (args[0] === "now") {
        console.log("Updating...");
        const { updated } = await pullLatestUpdates();
        if (updated) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: "Updated successfully. Restarting...",
          });
          await clearReact(sock, msg);
          setTimeout(() => {
            process.exit(0);
          }, 1500);
        } else {
          console.log("No updates found");
          return await sock.sendMessage(msg.key.remoteJid, {
            text: "No updates found",
          });
        }
      } else {
        const { commitLength, commits, available } = await checkForUpdates();
        const commitMessage = `Missing ${commitLength} updates\n` + commits;
        if (available) {
          console.log("Your version of mellow-md is outdated");
          await sock.sendMessage(msg.key.remoteJid, {
            text: commitMessage,
          });
        } else {
          await sock.sendMessage(msg.key.remoteJid, {
            text: "No updates found",
          });
          return;
        }
      }
    } catch (e) {
      console.log("Error checking for updates:", e.message);
      const text =
        e.response?.status === 404
          ? "Couldn't find this branch on GitHub — skipping update check."
          : "Error checking for updates: " + e.message;
      await sock.sendMessage(msg.key.remoteJid, { text });
    }
  },
};
