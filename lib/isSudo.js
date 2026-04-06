export default async function isSudo(userId) {
  return sudoUsers.includes(userId);
}