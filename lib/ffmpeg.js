import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ffmpeg(buffer, args = [], ext = "", ext2 = "") {
    return new Promise(async (resolve, reject) => {
        try {
            let databaseDir = path.join(__dirname, "../temp");
            if (!fs.existsSync(databaseDir)) {
                fs.mkdirSync(databaseDir, { recursive: true });
            }
            let tmp = path.join(__dirname, "../temp", +new Date() + "." + ext);
            let out = tmp + "." + ext2;
            await fs.promises.writeFile(tmp, buffer);
            spawn("ffmpeg", ["-y", "-i", tmp, ...args, out])
                .on("close", async (code) => {
                    try {
                        await fs.promises.unlink(tmp);
                        if (code !== 0)
                            return reject(
                                new Error(`ffmpeg exited with code ${code}`),
                            );
                        resolve(await fs.promises.readFile(out));
                        // await fs.promises.unlink(out)
                    } catch (err) {
                        reject(err);
                    }
                })
                .on("error", reject);
        } catch (err) {
            reject(err);
        }
    });
}

function toAudio(buffer, ext) {
    return ffmpeg(
        buffer,
        ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"],
        ext,
        "mp3",
    );
}

function getDurationFromFile(buffer) {
    const dir = path.join(__dirname, "../temp");

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, Date.now() + ".mp4");

    fs.writeFileSync(filePath, buffer);

    try {
        const output = execSync(
            `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`
        );
        return parseFloat(output.toString());
    } catch {
        return 0;
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

export { toAudio, getDurationFromFile };
