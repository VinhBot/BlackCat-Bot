const mongoose = require("mongoose");

const database = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.String,
  GuildName: mongoose.SchemaTypes.String,
  WelcomeChannel: mongoose.SchemaTypes.String,
  GoodbyeChannel: mongoose.SchemaTypes.String, 
  AutoAddRoleWel: mongoose.SchemaTypes.Array,
});

module.exports = mongoose.model("welcomeGoodbye", database);