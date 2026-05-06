import fs from 'fs'
import path from 'path'
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_FILE_PATH = path.resolve(__dirname, '../data/store.json')
const MAX_SIZE = 5000;

const loadSeen = () => {
   if(!fs.existsSync(STORE_FILE_PATH)) {
     return new Set()
   }
   const data = JSON.parse(fs.readFileSync(STORE_FILE_PATH, 'utf8') || '[]')
   return new Set(data)
}

const saveSeen = (set) => {
  let arr = [...set]
  if(arr.length > MAX_SIZE) {
    arr = arr.slice(arr.length - MAX_SIZE)
  }
  fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(arr))
}

const seenMessages = loadSeen()

const hasSeenMessage = (msgId) => {
    return seenMessages.has(msgId);
}

const markMessageSeen = (msgId) => {
    seenMessages.add(msgId);
    saveSeen(seenMessages);
}

export { hasSeenMessage, markMessageSeen };