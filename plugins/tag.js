export default {
   name: "tag",
   description: "Tag all members",
   isPublic: false,
   category: "Group",
   Usage: "tag all|admins|nonadmins or reply to a message with tag",
   execute: async (sock, msg, args, quotedMessage) => {
      const remoteJid = msg.key.remoteJid;
      if (!remoteJid.endsWith("@g.us")) {
         return sock.sendMessage(remoteJid, {
            text: "This command only works in groups.",
         });
      }
      const metadata = await sock.groupMetadata(remoteJid);
      const members = metadata.participants.map((p) => p.id);
      const message = args.join(" ");
      const repliedMessage =
         quotedMessage?.conversation ||
         quotedMessage?.extendedTextMessage?.text;
      const options = ["all", "admins", "nonadmins"];
      if (!message && !repliedMessage) {
         return sock.sendMessage(remoteJid, {
            text: "Provide a message to tag members with.",
         });
      } else if (message === options[0]) {
         const mentions = members
            .map((member) => `@${member.split("@")[0]}`)
            .join("\n");
         await sock.sendMessage(remoteJid, {
            text: mentions,
            mentions: members,
         });
      } else if (message === options[1]) {
         const admins = metadata.participants
            .filter((p) => p.admin)
            .map((p) => p.id);
         const mentions = admins
            .map((admin) => `@${admin.split("@")[0]}`)
            .join("\n");
         await sock.sendMessage(remoteJid, {
            text: mentions,
            mentions: admins,
         });
      } else if (message === options[2]) {
         const admins = metadata.participants
            .filter((p) => p.admin)
            .map((p) => p.id);
         const nonAdmins = members.filter((member) => !admins.includes(member));
         const mentions = nonAdmins
            .map((nonAdmin) => `@${nonAdmin.split("@")[0]}`)
            .join("\n");
         await sock.sendMessage(remoteJid, {
            text: mentions,
            mentions: nonAdmins,
         });
      } else if (repliedMessage) {
         await sock.sendMessage(remoteJid, {
            text: `${repliedMessage}`,
            mentions: members,
         });
      } else if (!options.includes(message)) {
         await sock.sendMessage(remoteJid, {
            text: `${message}`,
            mentions: members,
         });
      }
   },
};
