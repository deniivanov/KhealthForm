import mongoose from 'mongoose';

if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Global cache for connection (survives hot reloads in dev)
const globalWithMongoose = global as typeof globalThis & { mongoose?: MongooseCache };

const cached: MongooseCache = globalWithMongoose.mongoose ?? { conn: null, promise: null };
globalWithMongoose.mongoose = cached;

async function connectDB(): Promise<typeof mongoose> {
    // Read at call time so scripts can load env files before connecting
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable in .env.local');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            tls: true,
            authSource: 'admin',
            dbName: 'khealth',
            bufferCommands: false,
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
}

export default connectDB;
