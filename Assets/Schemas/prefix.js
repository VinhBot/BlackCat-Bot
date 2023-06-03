const config = require(`${process.cwd()}/config.json`);
const mongoose = require("mongoose");

const database = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.Number,
  GuildName: mongoose.SchemaTypes.String,
  Prefix: { 
    type: mongoose.SchemaTypes.String, 
    default: config.prefix 
  }
});

module.exports = mongoose.model("prefix", database);