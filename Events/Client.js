const { Client: DiscordClient, GatewayIntentBits, Partials, Collection } = require("discord.js");
const mongoose = require("mongoose");
const { EconomyHandler } = require(`${process.cwd()}/Events/functions`);

const Client = class extends DiscordClient {
  constructor() {
    super({
      messageCacheLifetime: 60,
      fetchAllMembers: false,
      messageCacheMaxSize: 10,
      restTimeOffset: 0,
      restWsBridgetimeout: 100,
      shards: "auto",
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      intents: Object.keys(GatewayIntentBits),
      partials: Object.keys(Partials),
    });
    /*================================================================================================================*/
    this._init();
    this._connectMongoodb();
    /*================================================================================================================*/
    this.login(process.env.token);
    /*================================================================================================================*/
    this.cs = new EconomyHandler({
      EcoPath: "./Assets/Database/economy.json",
      setFormat: ["vi-VN", "VND"], // xác định loại tiền của các nước
      // Đặt số tiền ngân hàng mặc định khi người dùng mới được tạo!
      setDefaultWalletAmount: 10000, // trong ví tiền
      setDefaultBankAmount: 10000, // trong ngân hàng
      setMaxWalletAmount: 10000,// Đặt số lượng tiền trong ví tiền tối đa mặc định mà người dùng có thể có! ở đây 0 có nghĩa là vô hạn.
      setMaxBankAmount: 0, // Giới hạn dung lượng ngân hàng của nó ở đây 0 có nghĩa là vô hạn.
    });
  };
  _init() {
    this.aliases = new Collection();
    this.commands = new Collection();
    this.cooldowns = new Collection();
  };
  _connectMongoodb() {
    const mongo = "mongodb+srv://nguyenvinh:blackcat2k3@cluster0.bgyio.mongodb.net/";
    mongoose.set("strictQuery", false);
    if(!mongo) {
      console.warn("[WARN] URI/URL Mongo không được cung cấp! (Không yêu cầu)");
    } else {
      mongoose.connect(mongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        console.log("Đã kết nối đến mongoodb".blue);
      }).catch((err) => console.log(err));
    }
  };
};

module.exports = Client;