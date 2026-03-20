import dotenv from 'dotenv'
dotenv.config()

export default {
    prefix: '.',
    ownerNumber: process.env.OWNER_NUMBER || '',
    reactEmoji: process.env.REACT_EMOJI || '✨',
    autoUpdate: process.env.AUTO_UPDATE === 'true',
    alwaysOnline: process.env.ALWAYS_ONLINE === 'true',
    stickerPackname: process.env.STICKER_PACKNAME || 'Mellow MD',
    stickerAuthor: process.env.STICKER_AUTHOR || 'Mellow',
    geniusApiKey: process.env.GENIUS_API_KEY || '',
    platform: process.env.PLATFORM || 'Unknown',
}
