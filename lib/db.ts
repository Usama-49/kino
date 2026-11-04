import mongoose from "mongoose";
import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  console.error(e);
}

const MONGODB_URI = process.env.MONGO_URI!;

if (!MONGODB_URI) {
  throw new Error("Plz define MONGO_URI in env variables!");
}
declare global {
  var mongoose:
    | {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
      }
    | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }
  if (cached?.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      family: 4,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((res) => res);
  }
  try {
    cached.conn = await cached?.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
