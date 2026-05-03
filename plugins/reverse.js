import { reverseAudio, reverseVideo } from "../lib/ffmpeg.js";

export default {
  name: "reverse",
  description: "Reverse video or audio",
  isPublic: false,
  category: "Media",
  usage: 'Reply with a video or audio with .reverse',
  execute: async(sock, msg, args, quotedMessage) => {
    
  }
}
