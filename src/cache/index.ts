/*
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
    await redis.hmset(key, roominfo);
    await redis.hmset(roominfo.id, roominfo)
}

export const getRoom = async (key: string) => {
    const info = await redis.hmget(key, "id", "createdAt", "status", "password");
    return (info[0] == null ? null : info);
}

export const clearRoomForUser = async (key: string) => {
  const values = await getRoom(key);
  if (values != null) {
    const id = values[0];
    if (id != null) {
      console.log("Found room Id, deleting it!")
      await redis.del(id)
    }
  }
  await redis.del(key); 
}
*/