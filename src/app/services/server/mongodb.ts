// services/server/mongodb.ts
import { MongoClient, ServerApiVersion } from "mongodb";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// משתנים גלובליים כדי למנוע התחברות מחדש ב־Next.js בזמן פיתוח
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // נגדיר משתנה גלובלי עבור הסביבה של Node.js
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI as string;
  if (!uri) {
    console.warn("⚠️ MONGODB_URI not defined - database operations will be skipped");
    // Return a mock database object for build time
    return {
      collection: () => ({
        findOne: async () => null,
        find: () => ({ toArray: async () => [] }),
        insertOne: async () => ({ insertedId: 'mock' }),
        updateOne: async () => ({ modifiedCount: 0 }),
        deleteOne: async () => ({ deletedCount: 0 })
      })
    } as any;
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  const connectedClient = await clientPromise;
  const db = connectedClient.db("Eco-Track");
  return db;
}
