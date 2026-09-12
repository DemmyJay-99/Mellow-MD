import fs from "fs/promises";
import { existsSync } from "fs";

const sudoPath = "./data/sudo.json";
export const sudoUsersCache = new Set();

export async function loadSudoUsers() {
  if (!existsSync(sudoPath)) {
    await fs.mkdir("./data", { recursive: true });
    await fs.writeFile(sudoPath, "[]");
  }
  const raw = await fs.readFile(sudoPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    console.error("sudo.json is corrupted, defaulting to empty list");
    return [];
  }
}

export async function refreshSudoCache() {
  const sudoUsers = await loadSudoUsers();
  sudoUsersCache.clear();
  for (const user of sudoUsers) sudoUsersCache.add(user);
}

export function isSudo(userId) {
  return sudoUsersCache.has(userId);
}

await refreshSudoCache();