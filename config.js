import { configDotenv } from "dotenv";

configDotenv({
    path: "./config.env",
    quiet: true 
})
export default {
  prefix: ["!", "."],
  botName: "Mellow MD",
  OwnerName: "Mellow",
  reactEmoji: "✨",
  aza: { bank: process.env.BANK_NAME, number: process.env.BANK_NUMBER, AccName: process.env.BANK_ACCOUNT_NAME },
};
