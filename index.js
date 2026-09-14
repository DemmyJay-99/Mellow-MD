import {
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    makeWASocket,
    Browsers
} from "@whiskeysockets/baileys";
import { configDotenv } from "dotenv";
configDotenv({
    quiet: true,
    path: "./config.env",
});
import pino from "pino";
import { initSession, validateCreds } from "./lib/session.js";
import handleMessage from "./lib/messageHandler.js";
import store from "./lib/store.js";
import { exec } from "child_process";
import { pullLatestUpdates } from "./lib/update.js";
import messagem from "./lib/message.js";
import { groupCache } from "./lib/index.js";
await pullLatestUpdates().catch(() => console.log("Error checking for updates"));
setInterval(async () => {
    await pullLatestUpdates().catch(() => console.log("Error checking for updates"));
}, 1000 * 60 * 60 * 24);
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
        getMessage: async (key) => {
            const msgId = key.id;
            console.log("Getting message from DB")
            const message = await store.getMessage(msgId);
            return message || "";
        },
        shouldSyncHistoryMessage: () => false,
        printQRInTerminal: false,
        browser: Browsers.android("Mellow"),
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
                setTimeout(() => {
                    isRestarting = false;
                    startBot();
                }, 5000);
            }
        }
    });

    sock.ev.on("messages.upsert", async (message) => {
        try {
            await handleMessage(sock, message);
        } catch (error) {
            console.error("Error in message handler:", error);
        }
    });

    sock.ev.on("group-participants.update", async (update) => {
        try {
            const groupId = update.id;
            groupCache.delete(groupId);
        } catch (error) {
            console.error("Error in group participants update handler:", error);
        }
    });

    return sock;
};

startBot();
