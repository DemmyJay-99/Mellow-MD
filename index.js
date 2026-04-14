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
    quiet: true,
});
import { exec } from "child_process";
import checkUpdates from "./lib/checkUpdates.js"

checkUpdates();
setInterval(checkUpdates, 1000 * 60 * 60);
let hasSent = false;
const startBot = async () => {
    let BOT_START_TIME = Infinity;
    let CONNECTED_AT_MS = 0;
    const STARTUP_GRACE_MS = 15000
    const seenMessages = new Set();
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
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        printQRInTerminal: false,
        markOnlineOnConnect: process.env.ALWAYS_ONLINE === "true" || false,
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            CONNECTED_AT_MS = Date.now();
            BOT_START_TIME = Math.floor(CONNECTED_AT_MS / 1000);
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
                hasSent = true;
            }
            if (!hasSent) {
                sendMessage();
            }
            console.log('Connected to whatsapp');
        } else if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        }
    });
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
         if (CONNECTED_AT_MS && Date.now() - CONNECTED_AT_MS < STARTUP_GRACE_MS) {
            return;
          }
        const msg = messages[0];
        if (!msg || !msg.message) return;
        if (type !== "notify") {
            return      
        }
        const messageTime = msg.messageTimestamp;
        
        if (messageTime < BOT_START_TIME) {
            console.log("Message received before bot started, ignoring...");
            return;      
        };

        if (seenMessages.has(msg.key.id)) return;
        seenMessages.add(msg.key.id);
        const id = msg.key.id
         setTimeout(() => seenMessages.delete(id), 60 * 1000);
        
        // const fromMe = msg.key.fromMe;
        // const botJid = sock.user?.id;
        // if (fromMe) return;
        try {
            await handleCommand(sock, msg);
        } catch (error) {
            console.error("Error in message handler:", error);
        }
    });

    return sock;
};

startBot();
