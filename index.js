import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser, 
    delay,
    makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import { configDotenv } from "dotenv";
import pino from 'pino'
import checkSessionID from "./lib/session.js";
import handleCommand from "./lib/commandHandler.js";
configDotenv()

const startBot = async () =>{
    await checkSessionID(process.env.SESSION_ID);
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({
        auth: state,
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({
            level: "fatal"
        })),
        logger: pino({level: "fatal"}),
        markOnlineOnConnect: false,
        printQRInTerminal: false,
        keepAliveIntervalMs: 30000
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if(connection === 'open'){
            console.log("Connected to whatsapp")
            const user = sock.user.id.split(':')[0] + '@s.whatsapp.net'
            sock.sendMessage(user, {
                text: "Your bot has been deployed successfully"
            })
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if(shouldReconnect){
                startBot()
            }
        }
    })
    sock.ev.on("messages.upsert", async({messages}) => {
        const msg = messages[0];
        if (!msg || !msg.message) return
        const fromMe = msg.key.fromMe;
        const botJid = sock.user?.id;
        if (fromMe && msg.key.remoteJid === botJid) return

        try {
            await handleCommand(sock, msg)
        } catch (error) {
            console.error('Error in message handler:', error);
        }
    });

    return sock
}

startBot()