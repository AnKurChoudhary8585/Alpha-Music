import Song from './models/Song.js';

export const getSongs = async (req, res) => {
  const songs = await Song.find();
  res.json(songs);
};

export const uploadSong = async (req, res) => {
  const newSong = new Song(req.body);
  await newSong.save();
  res.status(201).json(newSong);
};