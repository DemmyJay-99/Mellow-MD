import axios from "axios";
import path from 'path'
import { fileURLToPath } from "url";
import fs from 'fs-extra';
import { exec } from "child_process";
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Save credentials
 * @param {string} sessionID 
 */

const checkSessionID = async (sessionID) => {
    try {
        const GITHUB_USERNAME = "DemmyJay-99";
        const sessionDir = path.join(__dirname, '..', 'session')
        const credsPath = path.join(sessionDir, 'creds.json')
        if(fs.existsSync(credsPath)) {
            console.log("SESSION VALIDATED")
            return
        }
        if (!sessionID || sessionID === "") {
            throw new Error("Enter a valid session")
        };
            const gistURL = `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${sessionID}/raw/creds.json`
            const response = await axios.get(gistURL);
            const data = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
            if(!fs.existsSync(sessionDir)) {
                fs.mkdirSync(sessionDir, {recursive: true})
            }
            fs.writeFileSync(credsPath, data)
            console.log("Session validated")
    } catch (error) {
        console.error(error);
        throw error
    }
};

export default checkSessionID