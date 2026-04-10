import {execSync} from "child_process";
export default {
  name: "update",
  description: "Update the bot",
  isPublic: false,
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
          console.log("Updated successfully. Restarting...");
          await sock.sendMessage(msg.key.remoteJid, {
            text: "Updated successfully. Restarting...",
          });
          process.exit(0);
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
        if (local !== remote) {
          console.log("Your version of mellow-md is outdated");
          await sock.sendMessage(msg.key.remoteJid, {
            text: "Your version of mellow-md is outdated. Use .update now to update",
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
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Error checking for updates: " + e.message,
      });
    }
  },
};
