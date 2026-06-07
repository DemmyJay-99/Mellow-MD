export default {
  name: "add",
  description: "Add a user to the group",
  category: "Group",
  usage: ".add <number> ",
  execute: async (sock, msg, args, mellow = {}) => {
    const { quotedMessageText, chatID, chatIDisGroup } = mellow;

    if (!chatIDisGroup) {
      return sock.sendMessage(chatID, {
        text: "This command only works in groups.",
      });
    }

    const metadata = await sock.groupMetadata(chatID);
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);

    if (!admins.includes(senderJid) && !msg.key.fromMe) {
      return sock.sendMessage(chatID, {text: "Admin only."});
    }

    let targetJid = quotedMessageText + "@s.whatsapp.net";

    if (!targetJid && args[0]) {
      const num = args[0].replace(/\D/g, "");
      if (!num) return sock.sendMessage(chatID, {text: "Provide a valid number."});
      targetJid = `${num}@s.whatsapp.net`;
    }

    if (!targetJid) {
      return sock.sendMessage(chatID, {
        text: "Reply to a user or use `.add <number>`.",
      });
    }

    try {
      const res = await sock.groupParticipantsUpdate(chatID, [targetJid], "add");
      const status = res?.[0]?.status;
      console.log(status);
      console.log(res);
      if (status === 200 || status === "200") {
        await sock.sendMessage(chatID, {text: "User added successfully."});
      } else {
        await sock.sendMessage(chatID, {text: "Failed to add user."});
      }
    } catch (e) {
      console.error("add error:", e);
      await sock.sendMessage(chatID, {text: "Failed to add user."});
    }
  },
};
