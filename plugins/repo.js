export default {
  name: "repo",
  description: "Get the repository link of the bot",
  category: "Bot",
  usage: "repo",
  execute: async (sock, msg, args) => {
    const remoteJid = msg.key.remoteJid;
    const link = "Repo link: https://github.com/DemmyJay-99/Mellow-MD.git\n\nDon't forget to give a star to the repo";
    await sock.sendMessage(remoteJid, {
      text: link,
      contextInfo: {
        externalAdReply: {
          title: "Mellow MD",
          thumbnailUrl: "https://i.ibb.co/fVJQHczm/siGOdOA.jpg",
          sourceUrl: "https://github.com/DemmyJay-99/Mellow-MD.git",
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    });
  },
};
