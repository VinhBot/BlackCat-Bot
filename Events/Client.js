const { Client, Partials, GatewayIntentBits, ActivityType, Collection, Routes, REST } = require("discord.js");
const { readdirSync } = require("fs");
const ascii = require("ascii-table");
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
    this.init();
    this.login(options.setToken);
    // xem bot đã online hay là chưa :))
    this._readyEvents(options);
    // kết nối tới mongodb 
    this._mongodb(options);
  };
  init() {
    this.maps = new Map();
    this.aliases = new Collection();
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.slashCommands = new Collection(); 
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
  /*========================================================
  # Ready Commands
  ========================================================*/
  commandHandler(options) {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên file", "Tình trạng");
    readdirSync(options.CommandPath).forEach(dir => {
      const commands = readdirSync(`${options.CommandPath}/${dir}/`).filter(file => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`${options.CommandPath}/${dir}/${file}`);
        if(pull.name) {
          this.commands.set(pull.name, pull);
          tableCmds.addRow(file, '✔');
        } else {
          tableCmds.addRow(file, '❌ => thiếu help name');
          continue;
        };
        if(pull.aliases && Array.isArray(pull.aliases)) {
           pull.aliases.forEach(alias => this.aliases.set(alias, pull.name));
        };
      };
    });
    console.log(tableCmds.toString().magenta);
  };
  slashHandler(options) {
    const SlashCmds = new ascii("BlackCat - Slash")
    SlashCmds.setHeading('Slash Commands', 'Trạng thái').setBorder('|', '=', "0", "0")
    const data = [];
    readdirSync(options.SlashCommandPath).forEach((dir) => {
      const slashCommandFile = readdirSync(`${options.SlashCommandPath}/${dir}/`).filter((files) => files.endsWith(".js"));
      for (const file of slashCommandFile) {
        const slashCommand = require(`${options.SlashCommandPath}/${dir}/${file}`);
        this.slashCommands.set(slashCommand.name, slashCommand);
        if(slashCommand.name) {
				  SlashCmds.addRow(file.split('.js')[0], '✅')
			  } else {
					SlashCmds.addRow(file.split('.js')[0], '⛔')
			  };
        if(!slashCommand.name) return; // console.log("thiếu tên lệnh")
        if(!slashCommand.description) return; // console.log("thiếu mô tả lệnh")
        data.push({
          name: slashCommand.name,
          description: slashCommand.description,
          type: slashCommand.type,
          options: slashCommand.options ? slashCommand.options : null,
        });
      };
    });
    const rest = new REST({ version: "10" }).setToken(options.setToken);
    this.on("ready", async() => {
      (async() => {
        try {
          await rest.put(Routes.applicationCommands(this.user.id), { body: data });
          console.info(`[SlashCommands] Đã tải lại thành công lệnh (/).`.green);
        } catch(error) {
          return console.info(error);
        };
      })();
    });
    console.log(SlashCmds.toString().red);
  };
  async eventHandler(options) {
    let Events = new ascii("Events");
    Events.setHeading("Tên file", "Trạng thái");
    const loadDir = (dir) => {
      const allevents = [];
      let amount = 0;
      const event_files = readdirSync(`${options.EventPath}/${dir}`).filter((file) => file.endsWith(".js"));
      for (const file of event_files) {
        try {
          const event = require(`${options.EventPath}/${dir}/${file}`);
          let eventName = file.split(".")[0];
          allevents.push(eventName);
          this.on(eventName, event.bind(null, this));
          Events.addRow(file, '✔');
          amount++;
        } catch(e) {
          Events.addRow(file, '❌');
          console.log(e);
        };
      };
    };
    await options.Events.forEach(e => loadDir(e));
    console.log(Events.toString().yellow);
  }
};
module.exports.Client = BlackCat;