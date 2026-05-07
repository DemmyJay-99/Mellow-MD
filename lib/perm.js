import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, "../data/perms.json");

if (!fs.existsSync(path.dirname(FILE_PATH))) {
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
}

let groupPerms = {};

function load() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({}));
  }
  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  groupPerms = JSON.parse(raw);
}

function save() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(groupPerms, null, 2));
}

load();

function enableCommand(groupId, command) {
  if (!groupPerms[groupId]) {
    groupPerms[groupId] = [];
  }
  const cmd = command.toLowerCase();
  if (!groupPerms[groupId].includes(cmd)) {
    groupPerms[groupId].push(cmd);
    save();
  }
}

function disableCommand(groupId, command) {
  if (!groupPerms[groupId]) return;
  const cmd = command.toLowerCase();
  groupPerms[groupId] = groupPerms[groupId].filter((c) => c !== cmd);
  save();
}

function isEnabled(groupId, command) {
  if (!groupPerms[groupId]) return false;
  return groupPerms[groupId].includes(command.toLowerCase());
}

function getEnabled(groupId) {
  return groupPerms[groupId] || [];
}

export { enableCommand, isEnabled, disableCommand, getEnabled };
