import crypto from 'crypto';
import fs from 'fs';

/**
 * Reads a file from a given path and calculates its SHA-256 hash.
 * @param {string} filePath The path to the file on the server.
 * @returns {string} The '0x'-prefixed SHA-256 hash of the file.
 */
export function calculateFileHash(filePath) {
    // 1. Read the file from the server's filesystem into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // 2. Use Node.js's built-in crypto library to hash the buffer
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 3. Return the hash in the format required by the smart contract
    return '0x' + hash;
}