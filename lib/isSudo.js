import fs from "fs"

export default async function isSudo(userId) {
  const sudoPath = "./data/sudo.json";

  if (!fs.existsSync(sudoPath)) {
    const dir = "./data";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(sudoPath, JSON.stringify([]));
  }

  const sudoUsers = JSON.parse(fs.readFileSync(sudoPath));
  return sudoUsers.includes(userId);
}