export default {
    name: "time",
    description: "Check the current time",
    isPublic: false,
    category: "Utility",
    execute : async (sock, msg, args) =>{
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const time = `${hour} : ${minute}`

        await sock.sendMessage(msg.key.remoteJid, {text : `${time}`})
    }
}