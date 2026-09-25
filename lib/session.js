import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { print } from "./log.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validate session creds
 */

const validateCreds = async () => {
  try {
    const sessionDir = path.join(__dirname, "..", "session");
    const credsPath = path.join(sessionDir, "creds.json");
    if (!fs.existsSync(credsPath)) {
      throw new Error("Session not found");
    }
    const creds = await fs.readJSON(credsPath);
    if (!creds.noiseKey || !creds.signedIdentityKey || !creds.signedPreKey || !creds.me?.id) {
      throw new Error("Invalid session");
    }
    if (!creds.registered) {
      throw new Error("Session not registered");
    }
    print("success", "SESSION VALIDATED")
  } catch (error) {
    print("error", `Error validating session: ${error.message}`);
    throw new Error(error.message);
  }
};

/**
 * Save credentials
 * @param {string} sessionID
 */

const initSession = async (sessionID) => {
  try {
    const GITHUB_USERNAME = "DemmyJay-99";
    const sessionDir = path.join(__dirname, "..", "session");
    const credsPath = path.join(sessionDir, "creds.json");
    if (fs.existsSync(credsPath)) {
      try {
        await fs.readJSON(credsPath);
        return;
      } catch {}
    }
    if (!sessionID || sessionID === "") {
      throw new Error("Enter a valid session");
    }
    const gistURL = `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${sessionID}/raw/creds.json`;
    const response = await axios.get(gistURL);
    if (response.status !== 200) {
      throw new Error("Invalid session");
    }
    const data = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    fs.writeFileSync(credsPath, data);
    print("success", "Session validated");
  } catch (error) {
    print("error", `Error validating session: ${error.message}`);
    throw error;
  }
};

export { initSession, validateCreds };
