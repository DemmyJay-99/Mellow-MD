import fs from "fs";
import {writeFile, readFile} from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function setvar(variable, value) {
  variable = variable.toUpperCase();
  process.env[variable] = value;
  const envFilePath = path.resolve(__dirname, "../.env");
  const envContent = await readFile(envFilePath, "utf8");
  const lines = envContent.split("\n");
  const varIndex = lines.findIndex((line) =>
    new RegExp(`^\\s*${variable}\\s*=`).test(line),
  );
  if (varIndex !== -1) {
    lines[varIndex] = `${variable}='${value}'`;
  } else {
    lines.push(`${variable}='${value}'`);
  }
  await writeFile(envFilePath, lines.join("\n"));
}

async function getvar(variable) {
  variable = variable.toUpperCase();
  return process.env[variable];
}

async function delvar(variable) {
  variable = variable.toUpperCase();
  delete process.env[variable];
  const envFilePath = path.resolve(__dirname, "../.env");
  const envContent = await readFile(envFilePath, "utf8");
  const lines = envContent.split("\n");
  const varIndex = lines.findIndex((line) =>
    new RegExp(`^\\s*${variable}\\s*=`).test(line),
  );
  if (varIndex !== -1) {
    lines.splice(varIndex, 1);
  }
  await writeFile(envFilePath, lines.join("\n"));
}

async function isGroup(jid) {
  return jid.endsWith("@g.us");
}

async function isPrivate(jid) {
  return jid.endsWith("@s.whatsapp.net");
}

async function isJid(jid) {
  const re = /^(\d+@s\.whatsapp\.net|\d+(?:-\d+)?@g\.us)$/;
  return re.test(jid);
}

export {
  getGroupConfig,
  setGroupConfig,
  getWarns,
  setWarns,
  readData,
  writeData,
  setvar,
  isGroup,
  isJid,
  isPrivate,
  getvar,
};
