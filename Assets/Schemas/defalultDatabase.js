const config = require(`${process.cwd()}/config.json`);
const mongoose = require("mongoose");

const database = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.Number,
  GuildName: mongoose.SchemaTypes.String,            // tên guilds
  setDefaultPrefix: { 
    type: mongoose.SchemaTypes.String, 
    default: config.prefix 
  },         // đặt prefix mặc định cho guild
  setDefaultMusicData: {                   // thiết lập mặc định dành cho hệ thống âm nhạc
    DefaultAutoresume: {
      type: mongoose.SchemaTypes.Boolean,
      default: true
    },               // 1: chế độ mặc định tự đông phát lại nhạc bot gặp sự cố
    DefaultAutoplay: {
      type: mongoose.SchemaTypes.Boolean,
      default: false
    },                // 2: chế độ tự động phát nhạc khi kết thúc bài hát
    DefaultVolume: { 
      type: mongoose.SchemaTypes.Number, 
      default: 50 
    },                     // 3: cài đặt âm lượng mặc định cho guild
    DefaultFilters: { 
      type: mongoose.SchemaTypes.Array, 
      default: ['bassboost', '3d'] 
    },   // 4: cài đặt filters mặc định cho guils
    MessageId: mongoose.SchemaTypes.Number,                         // 5: thiết lập id tin nhắn 
    ChannelId: mongoose.SchemaTypes.Number,                         // 6: thiết lập channelid
    ChannelAutoCreateVoice: mongoose.SchemaTypes.Number,            // 7: thiết lập id channel voice 
    Djroles: mongoose.SchemaTypes.Array                             // 8: thiết lập role chuyên nhạc                  
  },
  setDefaultWelcomeGoodbyeData: {              // thiết lập welcome, googbye, 
    WelcomeChannel: mongoose.SchemaTypes.Number,
    GoodbyeChannel: mongoose.SchemaTypes.Number, 
    AutoAddRoleWel: { 
      type: mongoose.SchemaTypes.Array, 
      default: undefined
    }
  },
  setDiaryChannel: {
    // voice
    voiceStateUpdate: mongoose.SchemaTypes.Number,
    // channel
    channelCreate: mongoose.SchemaTypes.Number,
    channelDelete: mongoose.SchemaTypes.Number,
    channelUpdate: mongoose.SchemaTypes.Number,
    // Guild
    guildMemberUpdate: mongoose.SchemaTypes.Number,
    guildCreate: mongoose.SchemaTypes.Number,
    guildDelete: mongoose.SchemaTypes.Number,
    guildUpdate: mongoose.SchemaTypes.Number
  },
});

module.exports = mongoose.model("defalutDatabases", database);