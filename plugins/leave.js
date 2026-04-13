export default {
   name: "leave",
   description: "Leave a group",
   isPublic: false,
   category: "Owner",
   usage: "leave",
   execute: async (sock, msg, args) => {
      await sock.groupLeave(msg.key.remoteJid);
   }
}