import mongoose from 'mongoose';
mongoose.set('debug', true); // Enable debug mode for queries

const MONGODB_URI = 'mongodb+srv://doadmin:6XfQ8xh92C315ew0@mongo-docean-1-401b1b9e.mongo.ondigitalocean.com/khealth'

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Global cache for connection
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        console.log("Using existing database connection");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("Connecting to MongoDB...");
        cached.promise = mongoose.connect(MONGODB_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true, // For debugging only, remove in production
            authSource: 'admin',
            dbName: 'khealth',
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("Connected to MongoDB successfully!");
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}

export default connectDB;
