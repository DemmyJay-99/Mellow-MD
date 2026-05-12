import normaliseLid from "../lib/normaliseLid.js";

export default {
  name: "jid",
  description: "Get the JID of a user",
  category: "Dev",
  usage: "jid",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    if (remoteJid.endsWith("@lid")) {
      const pn = await normaliseLid(sock, remoteJid);
      await sock.sendMessage(remoteJid, {text: pn + '@s.whatsapp.net'});
    } else {
      await sock.sendMessage(remoteJid, {text: remoteJid});
    }
  },
};
