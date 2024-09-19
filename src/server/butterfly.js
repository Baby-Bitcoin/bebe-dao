const fs = require('fs');
const path = require('path');
const readline = require('readline');

class InMemoryDB {

    static instances = {};

    static ADDRESSES_DB = 0;
    static POSTS_DB = 1;
    static VOTES_DB = 2;
    static COMMENTS_DB = 3;

    constructor() {
        if (InMemoryDB.instance) {
            return InMemoryDB.instance;
        }

        this.indexes = new Array(16).fill(null).map(() => ({})); // 16 indexes
        this.logDir = path.join(__dirname, 'db/'); // Log directory path

        // Ensure db folder exists
        this.ensureLogDirExists();

        // Initialize the DB and reconstruct from logs at startup
        this.reconstructFromLogs();

        InMemoryDB.instance = this;  // Save the instance
    }

    /**
     * Ensures the db directory exists. If it doesn't, creates it.
     */
    ensureLogDirExists() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
            console.log(`Created directory: ${this.logDir}`);
        }
    }

    /**
     * Reconstructs the in-memory database from log files during application startup using streams.
     * Implements key eviction to keep only the latest state of each key, and rewrites the log file to keep it small.
     */
    async reconstructFromLogs() {
        for (let i = 0; i < 16; i++) {
            const filePath = path.join(this.logDir, `${i}.txt`);
            if (fs.existsSync(filePath)) {
                console.log(`Reconstructing index ${i} from log file...`);

                const keyLatestState = {}; // Temporary storage for the latest key-value states

                const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
                const rl = readline.createInterface({
                    input: stream,
                    crlfDelay: Infinity
                });

                for await (const logLine of rl) {
                    if (logLine.trim()) {
                        const [timestamp, operation, jsonData] = logLine.split(' ', 3);
                        const data = JSON.parse(jsonData);

                        let key = this.convertKeyType(i, data.key);

                        if (operation === 'set') {
                            keyLatestState[key] = data.value;
                        } else if (operation === 'delete') {
                            keyLatestState[key] = null;
                        }
                    }
                }

                const compactedLog = [];
                for (const [key, value] of Object.entries(keyLatestState)) {
                    if (value !== null) {
                        this.setKey(i, key, value, false);
                        compactedLog.push(
                            `${Math.floor(Date.now() / 1000)} set ${JSON.stringify({ key: key.toString(), value })}`
                        );
                    } else {
                        this.deleteKey(i, key, false);
                    }
                }

                fs.writeFileSync(filePath, compactedLog.join('\n') + '\n', { encoding: 'utf-8' });
                console.log(`Reconstruction and compaction of index ${i} completed.`);
            }
        }
    }
    

    /**
     * Writes the log entry for a set or delete operation into the corresponding index file.
     * Uses the entire object stored in memory for set operations to log the full state.
     * Uses UNIX time in seconds for the timestamp.
     * 
     * @param {number} index - The index number (0-15) where the operation occurred.
     * @param {string} operation - The operation being performed: either 'set' or 'delete'.
     * @param {string} key - The key being set or deleted.
     * @param {boolean} logOperation - Whether to log the operation (defaults to true).
     */
    async writeLog(index, operation, key, logOperation = true) {
        if (logOperation) {
            const filePath = path.join(this.logDir, `${index}.txt`);
            const unixTimestamp = Math.floor(Date.now() / 1000);
            let logEntry;

            const keyString = key.toString();

            if (operation === 'set') {
                const value = this.indexes[index][key];
                logEntry = `${unixTimestamp} ${operation} ${JSON.stringify({ key: keyString, value })}\n`;
            } else {
                logEntry = `${unixTimestamp} ${operation} ${JSON.stringify({ key: keyString })}\n`;
            }
            fs.appendFileSync(filePath, logEntry);
        }
    }
    

    // Helper method to convert key to the appropriate type
    convertKeyType(index, key) {
        return index === InMemoryDB.ADDRESSES_DB ? String(key) : Number(key);
    }


    /**
     * Retrieves all keys stored in a specific index.
     * 
     * @param {number} index - The index (0-15) from which to retrieve the keys.
     * @returns {string[]} An array of strings representing all keys in the specified index.
     */
    async getAllKeys(index) {
        return Object.keys(this.indexes[index] || {});
    }

    /**
     * Retrieves `n` keys from a specific index, with pagination and order options.
     * 
     * @param {number} index - The index (0-15) from which to retrieve the keys.
     * @param {number} n - The number of keys to retrieve.
     * @param {number} page - The set of keys to retrieve (pagination offset).
     * @param {string} [order='normal'] - The order of keys ('normal' or 'reverse').
     * @returns {string[]} An array of strings representing the requested `n` keys in the specified index.
     */
    async getNKeys(index, n, page, order = 'normal') {
        const allKeys = await this.getAllKeys(index);
    
        // Handle ordering
        const orderedKeys = order === 'reverse' ? allKeys.reverse() : allKeys;
    
        // Calculate the offset and return the slice
        const start = page * n;
        return orderedKeys.slice(start, start + n);
    }

    async getIndexContent(index) {
        return this.indexes[index];
    }

    /**
     * Searches for keys that match a given regex pattern in a specific index.
     * 
     * @param {number} index - The index (0-15) to search within.
     * @param {string} pattern - A regex pattern string to search for within the keys.
     * @returns {string[]} An array of strings representing all keys that match the given pattern.
     */
    async searchKeys(index, pattern) {
        const regex = new RegExp(pattern);
        return this.getAllKeys(index).filter((key) => regex.test(key));
    }

    /**
     * Sets a key-value pair in a specific index, and logs the operation with the entire object stored in memory.
     * Preserves the data type of the value (e.g., array, object, string, etc.).
     * 
     * @param {number} index - The index (0-15) where the key-value pair should be stored.
     * @param {string} key - The key to be added or updated in the index.
     * @param {*} value - The value to be associated with the key. Can be any valid JavaScript object.
     * @param {boolean} logOperation - Whether to log the operation (defaults to true).
     */
    async setKey(index, key, value, logOperation = true) {
        key = this.convertKeyType(index, key);

        const existingValue = this.indexes[index][key];

        if (existingValue !== undefined) {
            if (Array.isArray(existingValue) && Array.isArray(value)) {
                value = Array.from(new Set([...existingValue, ...value])); // Deduplicate
            } else if (typeof existingValue === 'object' && typeof value === 'object') {
                value = { ...existingValue, ...value };
            }
        }

        this.indexes[index][key] = value;
        this.writeLog(index, 'set', key, logOperation);
    }

    /**
     * Retrieves the value associated with a key from a specific index.
     * 
     * @param {number} index - The index (0-15) to search within.
     * @param {string} key - The key whose value should be retrieved.
     * @returns {*} The value associated with the key, or null if the key does not exist.
     */
    async getKey(index, key) {
        key = index === InMemoryDB.ADDRESSES_DB ? String(key) : Number(key); // Convert key type
        return this.indexes[index][key] || null;
    }

    /**
     * Deletes a key from a specific index and logs the operation.
     * 
     * @param {number} index - The index (0-15) from which the key should be deleted.
     * @param {string} key - The key to be removed from the index.
     * @param {boolean} logOperation - Whether to log the operation (defaults to true).
     */
    async deleteKey(index, key, logOperation = true) {
        key = index === InMemoryDB.ADDRESSES_DB ? String(key) : Number(key); // Convert key type
        delete this.indexes[index][key]; // Remove the key from memory
        this.writeLog(index, 'delete', key, logOperation); // Log the deletion
    }

    /**
     * Returns the next available ID for POSTS_DB.
     * It finds the highest existing in-memory post id and returns one greater than that.
     * 
     * @returns {number} The new ID for the next post.
     */
    async getNewID() {
        const postsIndex = InMemoryDB.POSTS_DB;
        const allKeys = await this.getAllKeys(postsIndex);
    
        let maxId = 0;
    
        for (const key of allKeys) {
            const postData = await this.getKey(postsIndex, key);
            if (postData && typeof postData.id === 'number') {
            maxId = Math.max(maxId, postData.id);
            }
        }
    
        return maxId + 1;
    }
}

module.exports = { InMemoryDB, dbConnection: new InMemoryDB() };
