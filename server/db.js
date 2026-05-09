import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/alphamusic';
    // Add a fast 3-second timeout so it doesn't hang forever
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    console.log("🟢 MongoDB Connected Successfully");
  } catch (err) {
    console.error("🔴 MONGODB ERROR:", err.message);
    console.error("👉 Make sure MongoDB is actually installed and running on your computer!");
    console.error("If you don't have MongoDB installed locally, you need to set up a free MongoDB Atlas cloud cluster and put the URL in the .env file.");
    process.exit(1);
  }
};
export default connectDB;