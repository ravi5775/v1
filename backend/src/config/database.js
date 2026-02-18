import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectDB = async () => {
  let isConnectedToCloud = false;

  // 1. Priority: Attempt Cloud/Online Connection
  if (process.env.MONGO_URI) {
    try {
        console.log('------------------------------------------------');
        console.log('Config: MONGO_URI found.');
        console.log('Action: Attempting to connect to Online Database (MongoDB Atlas)...');
        
        // Attempt connection with a short timeout (5 seconds)
        // If internet is down, we don't want to wait forever.
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 
        });
        
        console.log('Status: ✅ Online Database Connected successfully.');
        console.log('------------------------------------------------');
        isConnectedToCloud = true;
    } catch (err) {
        console.warn('Warning: Failed to connect to Online Database.');
        console.warn(`Reason: ${err.message}`);
        console.log('Action: ⚠️ Switching to Offline Database (Fallback)...');
        console.log('------------------------------------------------');
        // We do not exit here; we let the code fall through to the local DB setup.
    }
  }

  if (isConnectedToCloud) return;

  // 2. Fallback: Use Embedded MongoDB (Local/Offline)
  try {
    console.log('------------------------------------------------');
    if (!process.env.MONGO_URI) {
        console.log('Config: No MONGO_URI found.');
    } else {
        console.log('Config: Online connection unavailable.');
    }
    console.log('Action: Starting embedded persistent MongoDB (Offline Mode)...');
    
    const dbPath = path.join(__dirname, '..', '..', '.mongodb');
    
    // Ensure the database directory exists before starting the server.
    await fs.mkdir(dbPath, { recursive: true });

    // This creates an in-memory MongoDB server that persists data to a file,
    // giving us a portable, zero-setup database.
    const mongod = await MongoMemoryServer.create({
        instance: {
            dbPath: dbPath, // Persist data here
            storageEngine: 'wiredTiger'
        }
    });
    
    const uri = mongod.getUri();
    
    await mongoose.connect(uri);

    console.log('Status: ✅ Offline Embedded MongoDB Connected successfully.');
    console.log('------------------------------------------------');
  } catch (err) {
    console.error('Fatal: Failed to connect to Offline MongoDB', err);
    process.exit(1);
  }
};

export default connectDB;