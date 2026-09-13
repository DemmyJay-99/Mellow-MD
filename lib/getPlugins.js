import fs from 'fs/promises';

async function getPlugins() {
    const plugins = [];
    const files = await fs.readdir('./plugins');
    for (const file of files) {
        if (file.endsWith('.js')) {
            const plugin = await import(`../plugins/${file}`);
            plugins.push(plugin.default);
        }
    }
    return plugins;
}

export default getPlugins