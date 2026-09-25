import fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { commandHandler } from "./command.js";
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
  groupPerms = JSON.parse(raw || "{}");
}

async function save() {
  await writeFile(FILE_PATH, JSON.stringify(groupPerms, null, 2));
}

load();
async function enableCommand(groupId, command) {
  const cmd = command.toLowerCase();

  const plugins = await commandHandler.getPlugins();
  const plugin = plugins.find((p) => p.name.toLowerCase() === cmd);

  if (!plugin) {
    console.warn(`Command "${cmd}" does not exist in plugins.`);
    return { success: false, message: `not_exist.` };
  }
  if (plugin.ownerOnly) {
    console.warn(`Command "${cmd}" is owner-only and cannot be enabled for groups.`);
    return { success: false, message: `owner_only.` };
  }

  if (!groupPerms[groupId]) groupPerms[groupId] = [];
  if (!groupPerms[groupId].includes(cmd)) {
    groupPerms[groupId].push(cmd);
    await save();
  }
  return { success: true };
}

async function disableCommand(groupId, command) {
  if (!groupPerms[groupId]) return;
  const cmd = command.toLowerCase();
  groupPerms[groupId] = groupPerms[groupId].filter((c) => c !== cmd);
  await save();
}

function isEnabled(groupId, command) {
  if (!groupPerms[groupId]) return false;
  return groupPerms[groupId].includes(command.toLowerCase());
}

function getEnabled(groupId) {
  return groupPerms[groupId] || [];
}

export { enableCommand, isEnabled, disableCommand, getEnabled };
