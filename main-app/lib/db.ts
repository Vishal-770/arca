import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "arca";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

type DbConnector = () => Promise<{ client: MongoClient; db: Db }>;
let customConnector: DbConnector | null = null;

/**
 * Allows injecting an in-memory or test database connector for automated tests.
 */
export function setCustomDatabaseConnector(connector: DbConnector | null) {
  customConnector = connector;
}

export async function connectToDatabase() {
  if (customConnector) {
    return customConnector();
  }

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // If the connection is already in progress, wait for it
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
