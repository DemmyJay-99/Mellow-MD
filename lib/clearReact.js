const clearReact = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
        react: {
            text: "",
            key: msg.key,
        },
    });
}

export default clearReact