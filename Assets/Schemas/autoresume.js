const mongoose = require("mongoose");

const database = new mongoose.Schema({
  guild: String,
  voiceChannel: String,
  textChannel: String,
  currentTime: Number,
  repeatMode: Number,
  autoplay: Boolean,
  playing: Boolean,
  volume: Number,
  filters: Array,
  songs: Array,
});

module.exports = mongoose.model("autoresume", database);