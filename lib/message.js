import day from "dayjs";
import config from "../config.js";
import getPlugins from "./getPlugins.js";
import p from "../package.json" with { type: "json" };
import { isUpdateAvailable } from "./update.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

day.extend(utc);
day.extend(timezone);

const message = async () => {
    const date = day().format("DD/MM/YYYY");
    const time = day().tz(process.env.TIMEZONE || "UTC").format("HH:mm:ss");
    const prefix = process.env.PREFIX
        ? process.env.PREFIX.split(",")
        : config.prefix;
    const autoUpdate =
        process.env.AUTO_UPDATE_BOT === "true" ? "ON ✅" : "OFF ❌";
    const alwaysOnline =
        process.env.ALWAYS_ONLINE === "true" ? "ON ✅" : "OFF ❌";
    const user = process.env.OWNER_NAME || config.OwnerName;
    const plugins = await getPlugins();
    const version = p.version;
    const updateAvailable = await isUpdateAvailable();
    const text =
        `╔═════════╗\n` +
        ` MELLOW MD V${version}\n` +
        `╚═════════╝\n` +
        `${updateAvailable ? "Update available!" : ""}\n` +
        `╔═══⚙ CONFIG══╗\n` +
        `   ❖ Prefix: ${prefix.join(' | ')}\n` +
        `   ❖ Auto Update: ${autoUpdate}\n` +
        `   ❖ Always online: ${alwaysOnline}\n` +
        `   ❖ User:  ${user}\n` +
        `   ❖ Plugins: ${plugins.length}\n` +
        `   ❖ Date: ${date}\n` +
        `   ❖ Time: ${time}\n` +
        `╚═══════════╝\n` +
        `*Mellow MD is now online*\n` +
        `▸ Type ${prefix[0]}menu to see all commands\n` +
        `Join for updates: https://t.me/mellowmd`;
    return text;
};

export default message;
