export function formatSeconds(totalSeconds) {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const parts = [];
    if (days > 0) parts.push(days + 'd');
    if (hours > 0) parts.push(hours + 'hr');
    if (minutes > 0) parts.push(minutes + 'mins');
    if (seconds > 0 || parts.length === 0) parts.push(seconds + 's');
    return parts.join(' ');  
}