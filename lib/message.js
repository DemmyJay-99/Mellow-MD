import day from 'dayjs'
import config from '../config.js'
import getPlugins from './getPlugins.js'
import p from '../package.json' with {type: "json"}

const message = async () => {
    const date = day().format('DD/MM/YYYY')
    const time = day().format('HH:mm:ss')
    const prefix      = process.env.PREFIX      || config.prefix
    const autoUpdate  = process.env.AUTO_UPDATE === 'true' ? 'ON ✅' : 'OFF ❌'
    const user  = process.env.OWNER_NAME || config.OwnerName
    const plugins = await getPlugins()
    const version = p.version;
//     const text = `╔══════════════╗
//      🤖 MELLOW MD V${version}
// ╚══════════════╝
// ╔═══⚙ CONFIG══╗
//    ❖ Prefix: ${prefix}
//    ❖ Auto Update: ${autoUpdate}
//    ❖ User:  ${user}
//    ❖ Plugins:
//    ${plugins.length}
//    ❖ Date: ${date}
//    ❖ Time: ${time}
// ╚════════════╝
// *Mellow MD is now online*\n
// ▸ Type ${prefix}menu to see all commands\n
// Join for updates: https://t.me/mellowmd
//     `
    const text = `╔═════════╗\n`+
                ` MELLOW MD V${version}\n`+
                `╚═════════╝\n`+
                `╔═══⚙ CONFIG══╗\n`+
                `   ❖ Prefix: ${prefix}\n`+
                `   ❖ Auto Update: ${autoUpdate}\n`+
                `   ❖ Always online: ${process.env.ALWAYS_ONLINE}\n`+
                `   ❖ User:  ${user}\n`+
                `   ❖ Plugins: ${plugins.length}\n`+
                `   ❖ Date: ${date}\n`+
                `   ❖ Time: ${time}\n`+
                `╚═════════╝\n`+
                `*Mellow MD is now online*\n`+
                `▸ Type ${prefix}menu to see all commands\n`+
                `Join for updates: https://t.me/mellowmd`
    return text
}

export default message