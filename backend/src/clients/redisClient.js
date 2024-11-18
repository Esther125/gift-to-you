import { createClient } from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient({
            socket: {
                reconnectStrategy: function (retries) {
                    if (retries > 5) {
                        console.log('Too many attempts to reconnect. Redis connection was terminated');
                        return new Error('Too many retries.');
                    } else {
                        return retries * 500;
                    }
                },
            },
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error', err);
            process.e;
        });
    }

    _connect = async () => {
        try {
            await this.client.connect();
            console.log('Redis Client connected');
        } catch (err) {
            console.error('Error connecting to Redis', err);
            throw err;
        }
    };

    _set = async (key, value) => {
        try {
            await this.client.set(key, value);
            console.log(`Set key: ${key} with value: ${value}`);
        } catch (err) {
            console.error('Error setting value in Redis', err);
            throw err;
        }
    };

    _setExpire = async (key, second = 0) => {
        try {
            if (second === 0) {
                const todayEnd = new Date().setHours(23, 59, 59, 999);
                this.client.expireAt(key, parseInt(todayEnd / 1000));
                return;
            }

            await this.client.expire(key, second);
            return;
        } catch (err) {
            console.error('Error setting expire in Redis', err);
            throw err;
        }
    };

    _get = async (key) => {
        try {
            const value = await this.client.get(key);
            console.log(`Get key: ${key} with value: ${value}`);
            return value;
        } catch (err) {
            console.error('Error getting value from Redis', err);
            throw err;
        }
    };

    _del = async (key) => {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('Error deleting key from Redis', err);
            throw err;
        }
    };

    _quit = async () => {
        try {
            await this.client.quit();
            console.log('Redis Client quit');
        } catch (err) {
            console.error('Error quitting Redis Client', err);
            throw err;
        }
    };
}

export default RedisClient;
