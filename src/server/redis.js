const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config({
  path: ".env",
});

class RedisClient {
  static instances = {};

  static ADDRESSES_DB = 0;
  static POSTS_DB = 1;
  static VOTES_DB = 2;

  constructor() {}

  static getInstance(dbNumber = 0) {
    if (!RedisClient.instances[dbNumber]) {
      RedisClient.instances[dbNumber] = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        db: dbNumber,
      });

      // Define custom RedisJSON commands
      RedisClient.instances[dbNumber].defineCommand("jsonset", {
        numberOfKeys: 1,
        lua: 'return redis.call("JSON.SET", KEYS[1], ARGV[1], ARGV[2])',
      });
      RedisClient.instances[dbNumber].defineCommand("jsonget", {
        numberOfKeys: 1,
        lua: 'return redis.call("JSON.GET", KEYS[1])',
      });
    }

    return RedisClient.instances[dbNumber];
  }

  static async jsonset(dbNumber, key, json, path = ".") {
    const instance = this.getInstance(dbNumber);
    return instance.jsonset(String(key), path, JSON.stringify(json));
  }

  static async jsonget(dbNumber, key) {
    const instance = this.getInstance(dbNumber);
    const data = await instance.jsonget(String(key));
    return data ? JSON.parse(data) : null;
  }

  static async scan(dbNumber, pattern = "*", count = 1000) {
    const instance = this.getInstance(dbNumber);
    let cursor = "0";
    let keys = [];

    do {
      const result = await instance.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        count
      );
      cursor = result[0];
      keys = keys.concat(result[1]);
    } while (cursor !== "0");

    return keys;
  }

  static async delete(dbNumber, key) {
    const instance = this.getInstance(dbNumber);
    return instance.del(String(key));
  }

  static async getAllKeys(dbNumber) {
    const inst = this.getInstance(dbNumber);
    const keys = (await inst.keys("*"))
      .map((key) => parseInt(key))
      .sort(function (a, b) {
        return a - b;
      });

    return keys;
  }

  static async getLastKey(dbNumber) {
    const keys = await this.getAllKeys(dbNumber);
    const id = Number(keys[keys.length - 1]);

    return isNaN(id) ? 0 : id;
  }

  // Only works for DBs that uses integers as string as key
  static async getNewId(dbNumber) {
    return (await RedisClient.getLastKey(dbNumber)) + 1 || 1;
  }

  static async getAll(dbNumber) {
    const keys = await this.getAllKeys(dbNumber);
    let promises = [];
    keys.forEach((key) => {
      promises.push(RedisClient.jsonget(RedisClient.POSTS_DB, key));
    });

    return Promise.all(promises);
  }
}

module.exports = RedisClient;
