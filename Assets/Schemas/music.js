const mongoose = require("mongoose");

const database = new mongoose.Schema({
    GuildId: mongoose.SchemaTypes.Number,
    GuildName: mongoose.SchemaTypes.String,   
    DefaultAutoresume: {
      type: mongoose.SchemaTypes.Boolean,
      default: true
    },               
    DefaultAutoplay: {
      type: mongoose.SchemaTypes.Boolean,
      default: false
    },               
    DefaultVolume: { 
      type: mongoose.SchemaTypes.Number, 
      default: 50 
    },                     
    DefaultFilters: { 
      type: mongoose.SchemaTypes.Array, 
      default: ['bassboost', '3d'] 
    },   
    MessageId: mongoose.SchemaTypes.String,                          
    ChannelId: mongoose.SchemaTypes.String,                         
    Djroles: mongoose.SchemaTypes.Array                                          
});

module.exports = mongoose.model("musicData", database);