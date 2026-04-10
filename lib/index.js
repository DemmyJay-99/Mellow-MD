import fs from "fs"


const ANTILINK_FILE = "./data/antilink.json";
const WARN_FILE = "./data/warn.json";

async function readData(FILE) {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data", { recursive: true });
  }
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

async function writeData(data, FILE) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

async function getGroupConfig(jid) {
  const data = await readData(ANTILINK_FILE);
  return data[jid] || { enabled: false, action: "delete" };
}

async function setGroupConfig(jid, config) {
  const data = await readData(ANTILINK_FILE);
  data[jid] = config;
  await writeData(data, ANTILINK_FILE);
}

async function getWarns(jid, sender) {
  const data = await readData(WARN_FILE);
  return data[jid]?.[sender] || 0;
}

async function setWarns(jid, sender, count) {
  const data = await readData(WARN_FILE);
  if (!data[jid]) data[jid] = {};
  data[jid][sender] = count;
  await writeData(data, WARN_FILE);
}

export { getGroupConfig, setGroupConfig, getWarns, setWarns };