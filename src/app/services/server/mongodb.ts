// src/app/services/server/mongodb.js
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI as string;

console.log("🧩 MONGODB_URI =", process.env.MONGODB_URI);


export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log("✅ Connected to MongoDB!");
}

run();
