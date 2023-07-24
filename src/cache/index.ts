import { Redis } from "ioredis";
import { RoomInfo } from "../room/response/response.roominfo.ts";

const portString = process.env.REDIS_PORT;
let port = 6379
if (portString) {
  port = +portString;
  if (isNaN(port)) {
    console.error('Invalid port:', portString);
  }
} else {
  console.error('REDIS_PORT environment variable not set');
}

const hostRaw = process.env.REDIS_HOST
let host = ""
if (hostRaw) {
    host = hostRaw
}
else {
    console.error('REDIS_HOST environment variable not set');
}

const redis = new Redis(port, host);

export const saveRoom = async (key: string, roominfo: RoomInfo) => {
    return redis.hmset(key, roominfo);
}

export const getRoom = async (key: string) => {
    return redis.hmget(key, "id", "createdAt", "status");
}

export const clearRoomForUser = async (key: string) => {
    return redis.del(key);
}
