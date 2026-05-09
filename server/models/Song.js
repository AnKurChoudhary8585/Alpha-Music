import mongoose from 'mongoose';

const SongSchema = new mongoose.Schema({
  title: String,
  artist: String,
  audioUrl: String,
  coverUrl: String,
});

export default mongoose.model('Song', SongSchema);