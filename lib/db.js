import DataBase from "better-sqlite3";
const db = new DataBase("./data/baileys_store.db");
db.pragma("journal_mode = WAL");
const createTable = () => {
  db.exec(
    `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY
        , jid TEXT NOT NULL
        , timestamp INTEGER NOT NULL
        , data TEXT NOT NULL
    )`,
  );
};

createTable();

const trimMsgObject = (msg) => {
  return {
    key: msg.key,
    message: msg.message,
    messageTimestamp: msg.messageTimestamp,
    pushName: msg.pushName,
  };
};

const insertStmt = db.prepare("INSERT OR REPLACE INTO messages (id, jid,timestamp, data) VALUES (?, ?, ?, ?)");
const getStmt = db.prepare("SELECT data FROM messages WHERE id = ?");

const saveMessage = (msg) => {
  const trimmedMsg = trimMsgObject(msg);
  const msgId = trimmedMsg.key.id;
  const jid = trimmedMsg.key.remoteJid;
  const timestamp = Number(trimmedMsg.messageTimestamp);
  const data = trimmedMsg;
  insertStmt.run(msgId, jid, timestamp, JSON.stringify(data));
};

const getMessage = (msgId) => {
  const row = getStmt.get(msgId);
  return row ? JSON.parse(row.data) : undefined;
};

// const mmm = {
//     key: {
//       remoteJid: '120363313295035669@g.us',
//       remoteJidAlt: undefined,
//       fromMe: true,
//       id: 'ACF68B6E76005E7339F7867EEFE79071',
//       participant: '72254905950341@lid',
//       participantAlt: undefined
//     },
//     messageTimestamp: 1781316802,
//     pushName: 'Roland',
//     broadcast: false,
//     newsletter: false,
//     status: 2,
//     message: {
//       senderKeyDistributionMessage:  {
//         groupId: '120363313295035669@g.us',
//         axolotlSenderKeyDistributionMessage: [Uint8Array]
//       },
//      conversation: 'G'
//  }}

export { saveMessage, getMessage };
