import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({
    path: ".env",
});

// Extend Redis types to include custom commands for JSON
declare module 'ioredis' {
    interface Redis {
        jsonset: (key: string, path: string, json: string) => Promise<string>;
        jsonget: (key: string) => Promise<string>;
    }
}

class RedisClient {
    private static instances: { [key: number]: Redis } = {};

    private constructor() { }

    public static getInstance(dbNumber: number = 0): Redis {
        if (!RedisClient.instances[dbNumber]) {
            RedisClient.instances[dbNumber] = new Redis({
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                db: dbNumber
            });

            // Define custom RedisJSON commands
            RedisClient.instances[dbNumber].defineCommand('jsonset', {
                numberOfKeys: 1,
                lua: 'return redis.call("JSON.SET", KEYS[1], ARGV[1], ARGV[2])'
            });
            RedisClient.instances[dbNumber].defineCommand('jsonget', {
                numberOfKeys: 1,
                lua: 'return redis.call("JSON.GET", KEYS[1])'
            });
        }

        return RedisClient.instances[dbNumber];
    }

    public static async jsonset(dbNumber: number, key: string, path: string, json: string): Promise<string> {
        const instance = this.getInstance(dbNumber);
        return instance.jsonset(key, path, json);
    }

    public static async jsonget(dbNumber: number, key: string): Promise<string> {
        const instance = this.getInstance(dbNumber);
        return instance.jsonget(key);
    }

    public static async scan(dbNumber: number, pattern: string = '*', count: number = 1000): Promise<string[]> {
        const instance = this.getInstance(dbNumber);
        let cursor = '0';
        let keys: string[] = [];

        do {
            const result = await instance.scan(cursor, 'MATCH', pattern, 'COUNT', count);
            cursor = result[0];
            keys = keys.concat(result[1]);
        } while (cursor !== '0');

        return keys;
    }

    public static async delete(dbNumber: number, key: string): Promise<number> {
        const instance = this.getInstance(dbNumber);
        return instance.del(key);
    }
}

export default RedisClient;