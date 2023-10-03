import { Redis, Requester } from '@upstash/redis';

const redisConfig = {
   url: process.env.UPSTASH_REDIS_REST_URL,
   token: process.env.UPSTASH_REDIS_REST_TOKEN,
};

export const db = new Redis(redisConfig as unknown as Requester);
