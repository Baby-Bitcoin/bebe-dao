# RedisClient Documentation

This documentation provides details on how to use the `RedisClient` class, a TypeScript-based utility for interacting with a Redis database using the `ioredis` library. The `RedisClient` class is a singleton, meaning there is only one instance per database number. It also extends the Redis command set to include custom JSON-based commands.

## Table of Contents
1. [Installation](#installation)
2. [Environment Setup](#environment-setup)
3. [Class Methods](#class-methods)
    - [getInstance](#getInstance)
    - [jsonset](#jsonset)
    - [jsonget](#jsonget)
    - [scan](#scan)
    - [delete](#delete)
4. [Usage Examples](#usage-examples)
    - [Setting and Getting JSON](#setting-and-getting-json)
    - [Scanning Keys](#scanning-keys)
    - [Deleting Keys](#deleting-keys)

## Installation

To use `RedisClient`, you need to have Node.js and the `ioredis` library installed. Install `ioredis` and `dotenv` using npm:

```bash
npm install ioredis dotenv
```

## Environment Setup

Create a `.env` file in your project root with the following content:

```
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
```

If `REDIS_HOST` and `REDIS_PORT` are not specified, the client will default to `127.0.0.1` and `6379` respectively.

## Class Methods

### `getInstance(dbNumber: number = 0): Redis`

This method retrieves the singleton instance of the Redis client for a specific database number. If the instance does not exist, it creates a new one.

- **Parameters:**
  - `dbNumber`: The Redis database number (default is `0`).

- **Returns:** A Redis instance connected to the specified database.

### `jsonset(dbNumber: number, key: string, path: string, json: string): Promise<string>`

This method sets a JSON object at a specific key and path in the Redis store using the `JSON.SET` command.

- **Parameters:**
  - `dbNumber`: The Redis database number.
  - `key`: The Redis key where the JSON object is stored.
  - `path`: The path within the JSON object where the data is stored.
  - `json`: The JSON string to be stored.

- **Returns:** A promise that resolves to the Redis response, typically `"OK"` if successful.

### `jsonget(dbNumber: number, key: string): Promise<string>`

This method retrieves a JSON object stored at a specific key using the `JSON.GET` command.

- **Parameters:**
  - `dbNumber`: The Redis database number.
  - `key`: The Redis key from where the JSON object is retrieved.

- **Returns:** A promise that resolves to the JSON string stored at the key.

### `scan(dbNumber: number, pattern: string = '*', count: number = 1000): Promise<string[]>`

This method scans the Redis store for keys matching a specified pattern.

- **Parameters:**
  - `dbNumber`: The Redis database number.
  - `pattern`: The pattern to match keys (default is `'*'`).
  - `count`: The maximum number of keys to return in each scan iteration (default is `1000`).

- **Returns:** A promise that resolves to an array of matching keys.

### `delete(dbNumber: number, key: string): Promise<number>`

This method deletes a key from the Redis store.

- **Parameters:**
  - `dbNumber`: The Redis database number.
  - `key`: The Redis key to delete.

- **Returns:** A promise that resolves to the number of keys deleted (0 or 1).

## Usage Examples

### Setting and Getting JSON

```typescript
import RedisClient from './RedisClient';

// Setting a JSON object
(async () => {
    const dbNumber = 0;
    const key = 'user:1001';
    const path = '.';
    const json = JSON.stringify({ name: 'John Doe', age: 30 });

    await RedisClient.jsonset(dbNumber, key, path, json);

    // Getting the JSON object
    const result = await RedisClient.jsonget(dbNumber, key);
    console.log(JSON.parse(result)); // { name: 'John Doe', age: 30 }
})();
```

### Scanning Keys

```typescript
import RedisClient from './RedisClient';

(async () => {
    const dbNumber = 0;
    const pattern = 'user:*';

    const keys = await RedisClient.scan(dbNumber, pattern);
    console.log(keys); // ['user:1001', 'user:1002', ...]
})();
```

### Deleting Keys

```typescript
import RedisClient from './RedisClient';

(async () => {
    const dbNumber = 0;
    const key = 'user:1001';

    const deletedCount = await RedisClient.delete(dbNumber, key);
    console.log(deletedCount); // 1 if key was deleted, 0 if key did not exist
})();
```

---

This documentation should provide a comprehensive guide to using the `RedisClient` class in your Node.js project. The examples demonstrate basic operations like setting and getting JSON data, scanning keys, and deleting keys from the Redis store.
