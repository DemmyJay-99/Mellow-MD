import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from '../config.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'config.env') })

const prefix = config.prefix || process.env.PREFIX; // or whatever you prefer
let ownerNumber = config.ownerNumber || process.env.OWNER_NUMBER;



// Load all commands
const commands = new Map();
export async function loadCommands() {
    console.log(__dirname)
    const commandFiles = fs.readdirSync(path.join(__dirname, "../plugins"))
    .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const { default: command } = await import(`../plugins/${file}`);
        if (typeof command.isPublic !== "boolean") command.isPublic = false;
        commands.set(command.name, command);
    }
    console.log(`loaded ${commands.size} commands`);
}

(async () => {
    await loadCommands();
})();
export function getCommands(){
    return Array.from(commands.values());
}
export default async function handleCommand(sock, msg) {
    try {
        const store = sock.signalRepository.lidMapping
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        if (!body || !body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        const rawSender = msg.key.participant || msg.key.remoteJid;
        let pn;
        if(rawSender.endsWith('@lid')){
            const p = await store.getPNForLID(rawSender)
            pn = p.split(":")[0]
        }
        const sender = pn;
        const isOwner = sender === ownerNumber;
        const isAllowed = config.allowedUsers.includes(sender) || isOwner || msg.key.fromMe;

        if(!isAllowed) {
            console.log(rawSender)
            return
        }
        console.log(sender)
        await sock.sendMessage(msg.key.remoteJid,
            {
                react: {
                    text: `${config.reactEmoji || process.env.REACT_EMOJI}`,
                    key: msg.key
                }
            }
        )
        await command.execute(sock, msg, args);
        async function removeReaction(){
                await sock.sendMessage(msg.key.remoteJid,
                {
                    react: {
                        text: '',
                        key: msg.key
                    }
                }
            )
            }
        setTimeout(removeReaction, 2000)
    } catch (err) {
        console.error("Error handling command:", err);
    }
}

