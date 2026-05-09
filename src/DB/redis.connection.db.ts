import { createClient } from "redis";
import { REDIS_URL } from "../config/config.service";
export const redisClient = createClient({
  url: REDIS_URL as string,
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.log("Redis connection error", error);
  }
};
export { connectRedis };
export default connectRedis;
