import chalk from "chalk";

/**
 * Prints a colored and timestamped message to the console.
 * 
 * @param {'info' | 'success' | 'warning' | 'error' | 'connection' | 'store'} type - The log category type.
 * @param {string} message - The message to be printed.
 */

export const print = (type, message) => {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: process.env.TIMEZONE || "Asia/Karachi",
  });
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    connection: chalk.cyan,
    store: chalk.magenta,
  };
  const color = colors[type] || chalk.white
  console.log(
    chalk.gray(`[${timestamp}]`) + ` ` + color(message)
  )
};

export const explicitLog = (...args) => {
  if (process.env.EXPLICIT_LOGS === "true") {
    print("info", ...args)
  }
};