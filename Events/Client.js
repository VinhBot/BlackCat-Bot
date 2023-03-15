const { Client, Partials, GatewayIntentBits, ActivityType } = require("discord.js");
const mongoose = require("mongoose");
require("colors");

const BlackCat = class extends Client {
  constructor(options) {
    super({
      messageCacheLifetime: 60,
      fetchAllMembers: false,
      messageCacheMaxSize: 10,
      restTimeOffset: 0,
      restWsBridgetimeout: 100,
      shards: "auto",
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: options.setReply,
      },
      intents: Object.keys(GatewayIntentBits),
      partials: Object.keys(Partials),
    });
    this.login(options.setToken);
    // xem bot đã online hay là chưa :))
    this._readyEvents(options);
    // kết nối tới mongodb 
    this._mongodb(options);
  };
  _readyEvents(options) {
    this.on("ready", () => {
      console.log(`${this.user.username} đã sẵn sàng hoạt động`.red); 
      setInterval(() => {
        this.user.setPresence({
          activities: [{ 
            name: options.setStatus[Math.floor(Math.random() * options.setStatus.length)], 
            type: ActivityType.Watching 
          }],
          status: 'dnd',
        });
  	  }, 5000);
    });
  };
  _mongodb(options) { 
    mongoose.connect(options.setMongoDB, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }).then(() => {
      console.log("Bot được kết nối với cơ sở dữ liệu!".blue)
    }).catch((err) => {
      console.error(`Lỗi kết nối Mongoose: \n${err.stack}`.red);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("Kết nối Mongoose khoing thành công".red);
    });
    mongoose.set('strictQuery', false);
  };
};

module.exports.Client = BlackCat;