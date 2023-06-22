const { Client: DiscordClient, GatewayIntentBits, Partials, Collection, Routes, REST } = require("discord.js");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { DisTube } = require("distube");
const ascii = require("ascii-table");
const mongoose = require("mongoose");
const colors = require("colors");
const fs = require("node:fs");
// yêu cầu các files
const { EconomyHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
/*========================================================
# Distube Events
========================================================*/
const spotifyPlugin = new SpotifyPlugin({ 
  parallel: true, // Mặc định là true. Có hoặc không tìm kiếm danh sách phát song song.
  emitEventsAfterFetching: true, // Mặc định là false. Phát addList và playSong sự kiện trước hoặc sau khi tìm nạp tất cả các bài hát.
  api: {
    clientId: config.clientId, // Client ID của ứng dụng Spotify của bạn (Tùy chọn - Được sử dụng khi plugin không thể tự động lấy thông tin đăng nhập)
    clientSecret: config.clientSecret, // Client Secret của ứng dụng Spotify của bạn (Tùy chọn - Được sử dụng khi plugin không thể tự động lấy thông tin đăng nhập)
    topTracksCountry: "US", // Mã quốc gia của các bản nhạc của nghệ sĩ hàng đầu (mã quốc gia ISO 3166-1 alpha-2). Mặc định là US.
  }
});
const ytDlpPlugin = new YtDlpPlugin({
  update: true // Mặc định là true. Cập nhật tệp nhị phân yt-dlp khi plugin được khởi chạy.
});
const soundCloudPlugin = new SoundCloudPlugin(/*{
  clientId : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Id khách hàng của tài khoản của bạn.
  oauthToken : "0-000000-000000000-xxxxxxxxxxxxxx", // Mã thông báo oauth của tài khoản của bạn. Được sử dụng để tìm nạp thêm dữ liệu bằng tài khoản SoundCloud Go+.
}*/);
// token, mongourl
const token = process.env.token || config.token;
const mongo = process.env.mongourl || config.mongourl;
/*========================================================
# DiscordClient Events
========================================================*/
const Client = class extends DiscordClient {
  constructor() {
    super({
      messageCacheLifetime: 60,
      messageCacheMaxSize: 10,
      fetchAllMembers: false,
      restTimeOffset: 0,
      restWsBridgetimeout: 100,
      shards: "auto",
      failIfNotExists: false,
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        users: [],
        roles: [],
        repliedUser: false,
      },
      partials: Object.keys(Partials),
      intents: Object.keys(GatewayIntentBits),
    });
    /*================================================================================================================*/
    this._init();
    this._antiCrash();
    this._launchEvent();
    this._connectMongoodb();
  };
  /*================================================================================================================*/
  _init() {
    this.maps = new Map();
    this.aliases = new Collection();
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.slashCommands = new Collection();
    // Hệ thống tiền tệ
    this.cs = new EconomyHandler({
      setFormat: ["vi-VN", "VND"], // xác định loại tiền của các nước
      // Đặt số tiền ngân hàng mặc định khi người dùng mới được tạo!
      setDefaultWalletAmount: 10000, // trong ví tiền
      setDefaultBankAmount: 10000, // trong ngân hàng
      setMaxWalletAmount: 0,// Đặt số lượng tiền trong ví tiền tối đa mặc định mà người dùng có thể có! ở đây 0 có nghĩa là vô hạn.
      setMaxBankAmount: 0, // Giới hạn dung lượng ngân hàng của nó ở đây 0 có nghĩa là vô hạn.
    });
    // Distube - bảng điều khiển nhạc nhẽo các thứ
    this.distube = new DisTube(this, {
      searchSongs: 0,
	    searchCooldown: 30,
	    leaveOnEmpty: true,
	    emptyCooldown: 25,
      savePreviousSongs: true, 
	    leaveOnFinish: false,
	    leaveOnStop: true,
	    nsfw: true,
	    plugins: [spotifyPlugin, ytDlpPlugin, soundCloudPlugin],
      youtubeCookie: config.youtubeCookie,
      ytdlOptions: {
        highWaterMark: 1024 * 1024 * 64,
        quality: "highestaudio",
        format: "audioonly",
        liveBuffer: 60000,
        dlChunkSize: 1024 * 1024 * 4,
        youtubeCookie: config.youtubeCookie,
      },
      emitAddListWhenCreatingQueue: false,
      emitAddSongWhenCreatingQueue: false,
      emitNewSongOnly: true,
    });
  };
  /*================================================================================================================*/
  _launchEvent() {
    return this.login(token).then(() => {
      this.executeEvents({
        eventsPath: `${process.cwd()}/Events/`,
        Events: ["Guilds", "Custom"]
      });
      this.commandHandler({
        setCommandPath: `${process.cwd()}/Commands/PrefixCommands/`
      });
      this.slashHandlers({
        setSlashCommandPath: `${process.cwd()}/Commands/SlashCommands/`
      });
    }).catch((e) => console.warn(e));
  };
  /*================================================================================================================*/
  _connectMongoodb() {
    if(!mongo) {
      console.warn("[WARN] URI/URL Mongo không được cung cấp! (Không yêu cầu)".red);
    } else {
      mongoose.set("strictQuery", false);
      mongoose.connect(mongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        console.log("Đã kết nối đến mongoodb".blue);
      }).catch((err) => console.log(err));
    }
  };
  /*================================================================================================================*/
  async executeEvents({ eventsPath, Events }) {
    let _Events = new ascii("Events - Create");
    _Events.setHeading("File", "Events");
    const loadDir = (dir) => {
      const eventFiles = fs.readdirSync(`${eventsPath}/${dir}`).filter((file) => file.endsWith('.js'));
      for (const file of eventFiles) {
    	  const event = require(`${eventsPath}/${dir}/${file}`);
	      if(event.eventName) {
          if(event.eventOnce) {
	      	  this.once(event.eventName, (...args) => {
              event.executeEvents(this, ...args);
            });
	        } else {
		        this.on(event.eventName, (...args) => {
              event.executeEvents(this, ...args);
            });
	        };
          _Events.addRow(file, '✔');
        } else {
          _Events.addRow(file, '❌');
        };
      };
    };
    await Events.forEach(e => loadDir(e));
    console.log(_Events.toString().yellow);
  };
  /*================================================================================================================*/
  commandHandler(options) {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên Lệnh", "Trạng thái");
    const commandsPath = options.setCommandPath //path_1.default.join(__dirname, options.setCommandPath);
    fs.readdirSync(commandsPath).forEach((dir) => {
      const commands = fs.readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`${commandsPath}/${dir}/${file}`);
        if(pull.name) {
          this.commands.set(pull.name, pull);
          tableCmds.addRow(file, '✔');
        } else {
          tableCmds.addRow(file, "❌");
          continue;
        };
        if(pull.aliases && Array.isArray(pull.aliases)) {
           pull.aliases.forEach(alias => this.aliases.set(alias, pull.name));
        };
      };
    });
    console.log(tableCmds.toString().magenta);
  };
  /*================================================================================================================*/
  slashHandlers(options) {
    const SlashCmds = new ascii("BlackCat - Slash");
    SlashCmds.setHeading("Tên lệnh", "Trạng thái");
    const slashCommandsPath = options.setSlashCommandPath // path_1.default.join(__dirname, options.setSlashCommandPath);
    const data = [];
    fs.readdirSync(slashCommandsPath).forEach((dir) => {
      const slashCommandFile = fs.readdirSync(`${slashCommandsPath}/${dir}/`).filter((files) => files.endsWith(".js"));
      for (const file of slashCommandFile) {
        const slashCommand = require(`${slashCommandsPath}/${dir}/${file}`);
        this.slashCommands.set(slashCommand.name, slashCommand);
        if(slashCommand.name) {
				  SlashCmds.addRow(file.split('.js')[0], '✔')
			  } else {
					SlashCmds.addRow(file.split('.js')[0], '❌')
			  };
        if(!slashCommand.name) return console.log("Thiếu tên lệnh".red);
        if(!slashCommand.description) return console.log("Thiếu mô tả lệnh".red);
        data.push({
          name: slashCommand.name,
          description: slashCommand.description,
          type: slashCommand.type,
          options: slashCommand.options ? slashCommand.options : null,
        });
      };
    });
    const rest = new REST({ version: "10" }).setToken(token);
    this.on("ready", () => (async() => {
      try {
        await rest.put(Routes.applicationCommands(this.user.id), { 
          body: data
        });
        console.log("Các lệnh (/) đã sẵn sàng".yellow);
      } catch(err) {
        console.log(err);
      };
    })());
    console.log(SlashCmds.toString().blue);
  };
  /*================================================================================================================*/
  _antiCrash() {
    // 
  };
};

module.exports = Client;