import fs from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { hasAudio, toOpus, videoToWebp } from "../lib/ffmpeg.js";
import { prepareWAMessageMedia, proto } from "@whiskeysockets/baileys";
import os from "os";
import store from "../lib/store.js";

const STICKER_SECONDS = 15;

const USAGE =
  "Reply to a video with asticker to turn it into an audio sticker.\n" +
  "Or reply to a voice note / song with asticker to save its audio, then reply to any sticker with asticker to add it.";

const saved = new Map();

const addAudioStickerFields = (proto) => {
  const { Message } = proto;
  if ("audioStickerMessage" in Message.prototype) return;

  const encodeMessage = Message.encode;
  Message.encode = function encode(m, w) {
    w = encodeMessage.call(this, m, w);
    if (m.audioStickerMessage != null)
      Message.FutureProofMessage.encode(m.audioStickerMessage, w.uint32(1074).fork()).ldelim(); // 134 << 3 | 2
    return w;
  };

  const encodeSticker = Message.StickerMessage.encode;
  Message.StickerMessage.encode = function encode(m, w) {
    w = encodeSticker.call(this, m, w);
    if (m.audioMessage != null) Message.AudioMessage.encode(m.audioMessage, w.uint32(210).fork()).ldelim(); // 26 << 3 | 2
    return w;
  };

  Message.prototype.audioStickerMessage = null;
  Message.StickerMessage.prototype.audioMessage = null;
};

const tempName = () => `asticker-${randomBytes(6).toString("hex")}`;
const TEMP_DIR = os.tmpdir();
const uploadVoice = async (sock, path, seconds) => {
  const output = join(TEMP_DIR, `${tempName()}.ogg`);
  try {
    const audio = await toOpus(path, output, seconds);
    const { audioMessage } = await prepareWAMessageMedia(
      { audio, mimetype: "audio/ogg; codecs=opus", ptt: true },
      { upload: sock.waUploadToServer },
    );
    return audioMessage;
  } finally {
    fs.rmSync(output, { force: true });
  }
};

const sendAudioSticker = async (sock, chatID, stickerMessage, audioMessage) => {
  const inner = proto.Message.create({
    stickerMessage: { ...stickerMessage, isAnimated: true, audioMessage },
  });

  return sock.relayMessage(
    chatID,
    {
      messageContextInfo: { messageSecret: randomBytes(32) },
      audioStickerMessage: { message: inner },
    },
    {},
  );
};

export default {
  name: "asticker",
  description: "audio sticker from a video, or add saved audio to a sticker",
  execute: async (sock, msg, args, mellow) => {
    const { chatID, quotedMessage, msgID, senderID, ctxInfo } = mellow;
    const key = `${chatID}:${senderID}`;
    addAudioStickerFields(proto);

    if (quotedMessage?.audioMessage) {
      saved.set(key, quotedMessage.audioMessage);
      return sock.sendMessage(chatID, { text: "Audio saved. Now reply to a sticker with asticker to add it." });
    }

    if (quotedMessage?.videoMessage) {
      const dlPath = join(TEMP_DIR, `${msgID}.mp4`);
      const filePath = await store.downloadMedia(quotedMessage?.videoMessage, "video", dlPath);
      try {
        if (!(await hasAudio(filePath))) {
          return sock.sendMessage(chatID, { text: "That video has no audio." });
        }
        const [webp, audioMessage] = await Promise.all([
          videoToWebp(await fs.promises.readFile(filePath), STICKER_SECONDS),
          uploadVoice(sock, filePath, STICKER_SECONDS),
        ]);
        const { stickerMessage } = await prepareWAMessageMedia({ sticker: webp }, { upload: sock.waUploadToServer });
        return sendAudioSticker(sock, chatID, stickerMessage, audioMessage);
      } finally {
        fs.rmSync(filePath, { force: true });
      }
    }

    if (quotedMessage?.stickerMessage) {
      const audioMessage = saved.get(key);
      if (!audioMessage) {
        return sock.sendMessage(chatID, {
          text: "No saved audio. Reply to a voice note or song with asticker first.",
        });
      }
      const { contextInfo, ...stickerMessage } = quotedMessage.stickerMessage;
      return sendAudioSticker(sock, chatID, stickerMessage, audioMessage);
    }
    return sock.sendMessage(chatID, { text: USAGE });
  },
};
