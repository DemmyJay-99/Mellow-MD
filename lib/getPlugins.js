import  fs from 'fs';

async function getPlugins() {
    const plugins = [];
    const files = fs.readdirSync('./plugins');
    for (const file of files) {
        if (file.endsWith('.js')) {
            const plugin = await import(`../plugins/${file}`);
            plugins.push(plugin.default);
        }
    }
    return plugins;
}

export default getPlugins