import isSudo from "./isSudo.js";
import { hasSeenMessage, markMessageSeen } from "./store.js";
import normaliseJidToPN from "./normaliseJidToPN.js";

const handleMessage = async (sock, message) => {
    const {messages, type} = message;
    if(type !== "notify") return;
    const msg = messages[0];
    if (!msg || !msg.message) return;
    const msgID = msg.key.id;
    if (hasSeenMessage(msgID)) {
        return;
    }
    markMessageSeen(msgID);
    const senderID = msg.key.participant || msg.key.remoteJid;
    const pn = await normaliseJidToPN(sock, senderID);
    if (!pn) {
        console.error(`Could not normalise JID to PN for sender: ${senderID}`);
        return;
    }
    const isSudoUser = await isSudo(pn);
    if (!isSudoUser) {
        return;
    }
}

export default handleMessage;