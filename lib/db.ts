import mongoose from "mongoose";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

// Set Cloudflare & Google DNS on node:dns and node:dns/promises to fix Windows SRV lookups
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.error("DNS Configuration Warning:", e);
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
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((res) => res);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("MongoDB Connection Failed:", err);
    throw err;
  }
  return cached.conn;
}
