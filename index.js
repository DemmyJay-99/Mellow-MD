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
            sock.sendMessage('2348105202390@s.whatsapp.net', {
                text: "Your bot has been deployed successfully"
            })
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if(shouldReconnect){
                startBot()
            }
        }
    })
}

startBot()