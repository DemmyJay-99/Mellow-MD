import {
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    makeWASocket,
} from "@innovatorssoft/baileys";
import { configDotenv } from "dotenv";
import pino from "pino";
import { initSession, validateCreds } from "./lib/session.js";
import handleMessage from "./lib/messageHandler.js";
configDotenv({
    quiet: true,
    path: "./config.env",
});
import { exec } from "child_process";
import checkUpdates from "./lib/checkUpdates.js";
import messagem from "./lib/message.js";
checkUpdates();
setInterval(checkUpdates, 1000 * 60 * 60 * 24);
let hasSent = false;
let sock;
let isRestarting = false;

const startBot = async () => {
    try {
        await initSession(process.env.SESSION_ID);
        await validateCreds();
    } catch (error) {
        console.error("Failed to validate session:", error.message);
        exec("npm stop");
        process.exit(0);
    }
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const logger = pino({ level: "fatal" });
    sock = makeWASocket({
        auth: state,
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
            state.keys,
            logger.child({ level: "fatal" }),
        ),
        logger: logger.child({ level: "fatal" }),
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        printQRInTerminal: false,
        markOnlineOnConnect: process.env.ALWAYS_ONLINE === "true" || false,
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            const user = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            if (!hasSent) {
                const text = await messagem();
                await sock.sendMessage(user, { text: text });
                hasSent = true;
            }
            console.log("Connected to whatsapp");
        } else if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
            if (shouldReconnect && !isRestarting) {
                isRestarting = true;
                console.log("Reconnecting...");
                // try {
                //     if (sock) {
                //         await sock.ev.removeAllListeners();
                //         await sock.ws.close();
                //     }
                // } catch (error) {
                //     console.log(error);
                // }

                setTimeout(() => {
                    isRestarting = false;
                    startBot();
                }, 5000);
            }
        }
    });
    // sock.ev.removeAllListeners("messages.upsert");

    sock.ev.on("messages.upsert", async (message) => {
        try {
            await handleMessage(sock, message);
        } catch (error) {
            console.error("Error in message handler:", error);
        }
    });

    return sock;
};

startBot();
