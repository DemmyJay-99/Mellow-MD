import isSudo from "./isSudo";
import { hasSeenMessage, markMessageSeen } from "./lib/store.js";
import normaliseJidToPN from "./normaliseJidToPN.js";

const handleMessage = async (sock, message) => {
    const {msg, type} = message;
    const msgID = msg.key.id;
    if(type !== "notify") return;
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