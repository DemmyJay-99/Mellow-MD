import {
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    makeWASocket,
} from "@innovatorssoft/baileys";
import { configDotenv } from "dotenv";
import pino from "pino";
import checkSessionID from "./lib/session.js";
import handleCommand from "./lib/commandHandler.js";
configDotenv({
    quiet: true
});
import { execSync, exec } from "child_process";
import config from "./config.js"

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

            if (process.env.AUTO_UPDATE === "true") {
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

checkUpdates();
setInterval(checkUpdates, 1000 * 60 * 60);

const startBot = async () => {
    try {
        await checkSessionID(process.env.SESSION_ID);
    } catch (error) {
        console.error("Failed to validate session:", error.message);
        exec("npm stop");
        process.exit(0);
    }
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const logger = pino({ level: "fatal" });
    const sock = makeWASocket({
        auth: state,
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
            state.keys,
            logger.child({ level: "fatal" }),
        ),
        logger: logger.child({ level: "fatal" }),
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        printQRInTerminal: false,
        markOnlineOnConnect: process.env.ALWAYS_ONLINE === "true" || false,
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            let hasSent = false;
            async function sendMessage() {
                const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                const ddd = await sock.sendMessage(user, {
                    text: "Your bot has been deployed successfully",
                });
                await sock.sendMessage(
                    user,
                    { text: "Welcome to mellow md" },
                    { quoted: ddd },
                );
                await sock.sendMessage(user, {
                    text: `Type ${config.prefix}menu to see all commands`,
                })
                hasSent = true;
            }
            if (!hasSent) {
                sendMessage();
            }
            console.log("Connected to whatsapp");
        } else if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        }
    });
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg || !msg.message) return;
        // const fromMe = msg.key.fromMe;
        // const botJid = sock.user?.id;
        // if (fromMe && msg.key.remoteJid === botJid) return;

        try {
            await handleCommand(sock, msg);
        } catch (error) {
            console.error("Error in message handler:", error);
        }
    });

    return sock;
};

startBot();
