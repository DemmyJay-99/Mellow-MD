import fs from "fs";

export async function loadSudoUsers() {
  const sudoPath = "./data/sudo.json";

  if (!fs.existsSync(sudoPath)) {
    fs.mkdirSync("./data", { recursive: true });
    fs.writeFileSync(sudoPath, "[]");
  }

  return JSON.parse(fs.readFileSync(sudoPath, "utf8"));
}

export const sudoUsersCache = new Set();

export async function refreshSudoCache() {
  const sudoUsers = await loadSudoUsers();

  sudoUsersCache.clear();

  for (const user of sudoUsers) {
    sudoUsersCache.add(user);
  }
}

export async function isSudo(userId) {
  if (sudoUsersCache.has(userId)) {
    return true;
  }

  await refreshSudoCache();
  return sudoUsersCache.has(userId);
}

 await refreshSudoCache().then(() => {
  console.log("Sudo users loaded into cache");
}).catch((err) => {
  console.error("Error loading sudo users into cache:", err);
});