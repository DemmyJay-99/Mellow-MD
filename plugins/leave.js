export default {
   name: "leave",
   description: "Leave a group",
   isPublic: false,
   category: "Owner",
   usage: "leave",
   execute: async (sock, msg, args) => {
      const jid = msg.key.remoteJid;
     if(!jid.endsWith("@g.us")){
        await sock.sendMessage(jid, {text: "This command only works in groups."});
     }
      await sock.groupLeave(jid);
   }
}