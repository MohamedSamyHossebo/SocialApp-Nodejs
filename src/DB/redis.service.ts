import { Types } from "mongoose";
import { redisClient } from "./redis.connection.db";
interface TokenParams {
  userId: string | number;
}
interface RevokeTokenParams extends TokenParams {
  jti: string;
}
interface RedisSetParams {
  key: string;
  value: any;
  ttl?: number | null;
}
export const revokeTokenKeyPrefix = ({ userId }: TokenParams) => {
  return `user:revokeToken:${userId}`;
};
export const revokeTokenKey = ({ userId, jti }: RevokeTokenParams) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

export const set = async ({
  key,
  value,
  ttl = null,
}: RedisSetParams): Promise<string | null> => {
  try {
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis Set Error", error);
    return null;
  }
};

export const get = async ({ key }: { key: string }): Promise<string | null> => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.log("Redis Get Error", error);
    return null;
  }
};

export const update = async ({
  key,
  value,
  ttl = null,
}: RedisSetParams): Promise<string | null | boolean> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis Update Error", error);
    return null;
  }
};

export const del = async ({ key }: { key: string }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.del(key);
  } catch (error) {
    console.log("Redis Delete Error", error);
  }
};

export const expire = async ({
  key,
  ttl,
}: {
  key: string;
  ttl: number;
}): Promise<string | number | boolean | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log("Redis expire Error", error);
    return null;
  }
};

export const ttl = async ({
  key,
}: {
  key: string;
}): Promise<boolean | number | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.ttl(key);
  } catch (error) {
    console.log("Redis ttl Error", error);
    return null;
  }
};

export const keys = async ({
  pattern,
}: {
  pattern: string;
}): Promise<string[] | null> => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis Keys Error", error);
    return null;
  }
};

export const FCM_Key = (userId: Types.ObjectId | string) => {
  return `user:FCM:${userId.toString()}`;
};

export const addFCM = async (
  userId: Types.ObjectId | string,
  FcmToken: string,
) => {
  return await redisClient.sAdd(FCM_Key(userId), FcmToken);
};

export const removeFCM = async (
  userId: Types.ObjectId | string,
  FcmToken: string,
) => {
  return await redisClient.sRem(FCM_Key(userId), FcmToken);
};

export const getFCM = async (userId: Types.ObjectId | string) => {
  return await redisClient.sMembers(FCM_Key(userId));
};
