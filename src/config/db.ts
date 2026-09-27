import mongoose from 'mongoose';
import { env } from './env.js';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  __mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.__mongoose ?? {
    conn: null,
    promise: null,
  };

globalWithMongoose.__mongoose = cached;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongooseInstance) => {
        console.log('MongoDB connected successfully.');
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error('MongoDB connection failed:', error);

    throw error;
  }
};