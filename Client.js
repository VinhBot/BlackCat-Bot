const { Client, Partials, GatewayIntentBits, ActivityType, Collection, Routes, REST } = require("discord.js");
const { readdirSync } = require("fs");
const ascii = require("ascii-table");
const mongoose = require("mongoose");
const path = require("node:path");
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
    // thiết lập evt
    this.init();
    // login bot
    this.login(options.setToken);
    // xem bot đã online hay là chưa :))
    this._readyEvents(options);
    // kết nối tới mongodb 
    this._mongodb(options);
  };
  init() {
    this.aliases = new Collection();
    this.commands = new Collection();
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
};

const optionHandlerEvents = class {
  constructor(options, option) {
    this.client = options;
    this.client2 = option.setClient;
  };
  /*========================================================
  # Ready Commands/ Slash/ Events
  ========================================================*/
  // Commands
  commandHandler(options) {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên file", "Tình trạng");
    const commandsPath = path.join(__dirname, options.CommandPath);
    readdirSync(commandsPath).forEach((dir) => {
      const commands = readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`${commandsPath}/${dir}/${file}`);
        if(pull.name) {
          this.client.commands.set(pull.name, pull);
          tableCmds.addRow(file, '✔');
        } else {
          tableCmds.addRow(file, '❌ => thiếu help name');
          continue;
        };
        if(pull.aliases && Array.isArray(pull.aliases)) {
           pull.aliases.forEach(alias => this.client.aliases.set(alias, pull.name));
        };
      };
    });
    console.log(tableCmds.toString().magenta);
  };
  // SlashCommands
  slashHandler(options) {
    const SlashCmds = new ascii("BlackCat - Slash");
    SlashCmds.setHeading('Slash Commands', 'Trạng thái').setBorder('|', '=', "0", "0");
    const slashCommandsPath = path.join(__dirname, options.SlashCommandPath);
    const data = [];
    readdirSync(slashCommandsPath).forEach((dir) => {
      const slashCommandFile = readdirSync(`${slashCommandsPath}/${dir}/`).filter((files) => files.endsWith(".js"));
      for (const file of slashCommandFile) {
        const slashCommand = require(`${slashCommandsPath}/${dir}/${file}`);
        this.client.slashCommands.set(slashCommand.name, slashCommand);
        if(slashCommand.name) {
				  SlashCmds.addRow(file.split('.js')[0], '✅')
			  } else {
					SlashCmds.addRow(file.split('.js')[0], '⛔')
			  };
        if(!slashCommand.name) return console.log("thiếu tên lệnh");
        if(!slashCommand.description) return console.log("thiếu mô tả lệnh");
        data.push({
          name: slashCommand.name,
          description: slashCommand.description,
          type: slashCommand.type,
          options: slashCommand.options ? slashCommand.options : null,
        });
      };
    });
    const rest = new REST({ version: "10" }).setToken(options.setToken);
    this.client.on("ready", async() => {
      (async() => {
        try {
          await rest.put(Routes.applicationCommands(this.client.user.id), { body: data });
          console.info(`[BlackCat-Club] Đã tải lại thành công lệnh (/).`.blue);
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
      const eventFiles = readdirSync(`${options.EventPath}/${dir}`).filter((file) => file.endsWith(".js"));
      for (const file of eventFiles) {
        try {
          const event = require(`${options.EventPath}/${dir}/${file}`);
          let eventName = file.split(".")[0];
          allevents.push(eventName);
          this.client.on(eventName, event.bind(null, this.client));
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
  };
};

module.exports = {
  Client: BlackCat,
  optionHandlerEvents
};