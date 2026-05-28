const normaliseJidToPN = async (sock, jid) => {
    if(!jid || typeof jid !== "string") return null;
    const isJid = jid.endsWith("@s.whatsapp.net");
    if(isJid) {
        return jid.split("@")[0];
    }
    if(!jid.endsWith("@lid")) {
        return jid.split("@")[0];
    };
    const store = sock.signalRepository.lidMapping;
    if(!store?.getPNForLID) {
        return null;
    }
    const pn = await store.getPNForLID(jid);
    if(!pn) {
        return null;
    }
    return pn.split(":")[0];
}

export default normaliseJidToPN;