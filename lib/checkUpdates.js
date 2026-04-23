import { execSync } from "child_process"

const checkUpdates = () => {
    try {
        console.log("Checking for updates...");

        execSync("git fetch", { stdio: "ignore" });

        const local = execSync("git rev-parse HEAD").toString().trim();
        const remote = execSync("git rev-parse origin/master")
            .toString()
            .trim();

        if (local !== remote) {
            console.log("Your version of mellow-md is outdated");

            if (process.env.AUTO_UPDATE_BOT === "true") {
                console.log("Updating...");

                execSync("git pull", { stdio: "inherit" });

                console.log("Updated successfully. Restarting...");
                process.exit(0);
            } else {
                console.log("Auto-update disabled. Please update manually.");
            }
        } else {
            console.log("No updates found");
        }
    } catch (e) {
        console.log("Error checking for updates:", e.message);
    }
};

export default checkUpdates;