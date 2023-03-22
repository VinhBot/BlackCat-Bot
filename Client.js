var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
const Discord = __importDefault(require("discord.js"));
const mongoose = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("node:path"));
const fs = __importDefault(require("node:fs"));
const ascii = require("ascii-table");
require("colors");
/*========================================================
# Language Package
========================================================*/
const I18nProvider = class {
    constructor() {
        var _a;
        this.FilepathPrefix = 'file:';
        this.DefaultLocale = 'vi';
        const localesPath = path_1.default.join((_a = global.__dirname) !== null && _a !== void 0 ? _a : __dirname, '.', 'Events', "Language");
        this.availableLocales = new Map(fs.default.readdirSync(localesPath).map(file => [path_1.default.basename(file, '.json'), path_1.default.resolve(localesPath, file)]));
    }
    loadFromLocale(locale) {
        let filepath = this.availableLocales.get(locale !== null && locale !== void 0 ? locale : this.DefaultLocal);
        let loaded = filepath !== undefined;
        if(!loaded && locale && locale.startsWith(this.FilepathPrefix)) {
            filepath = path_1.default.resolve(process.cwd(), locale.slice(this.FilepathPrefix.length));
        };
        try {
            if(filepath) {
                this.localeData = I18nProvider.flatten(JSON.parse(fs.default.readFileSync(filepath, 'utf-8')));
                loaded = true;
            };
        } catch(e) { };
        if (!loaded) {
            this.loadFromLocale(this.DefaultLocal);
            console.warn(`Không thể tải tập tin ngôn ngữ ${filepath !== null && filepath !== void 0 ? filepath : locale}. Sử dụng một mặc định.`);
        };
    }
    __switchLanguage(key, replacements) {
        if (this.localeData && this.localeData[key]) {
            let message = this.localeData[key];
            if (replacements) {
                Object.entries(replacements).forEach((replacement) => message = message.replace(`{${replacement[0]}}`, replacement[1].toString()));
            };
            return message;
        } else {
            console.warn(`xin lỗi ngôn ngữ ${key} của bạn không được hỗ trợ. Thay vào đó, hãy sử dụng ngôn ngữ khác.`);
            return key;   
        };
    }
    static flatten(object, objectPath = null, separator = '.') {
        return Object.keys(object).reduce((acc, key) => {
            const newObjectPath = [objectPath, key].filter(Boolean).join(separator);
            return typeof (object === null || object === void 0 ? void 0 : object[key]) === 'object' ? Object.assign(Object.assign({}, acc), I18nProvider.flatten(object[key], newObjectPath, separator)) : Object.assign(Object.assign({}, acc), { [newObjectPath]: object[key] });
        }, { });
    }
};
                                                      
const lc = __importDefault(new I18nProvider());
const switchLanguage = (id, replacements) => lc.default.__switchLanguage(id, replacements);
/*========================================================
# Events dành cho bot
========================================================*/
const BlackCat = class extends Discord.default.Client {
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
      intents: Object.keys(Discord.default.GatewayIntentBits),
      partials: Object.keys(Discord.default.Partials),
    });
    // setToken bot
    this.tokenBot = options.setToken;
    // thiết lập evt
    this.init();
    // login bot
    this.login(this.tokenBot);
    // kết nối tới mongodb 
    this._mongodb(options);
    // set ngôn ngữ cho package
    lc.default.loadFromLocale(options.setLanguage);
  };
  init() {
    this.aliases = new Discord.default.Collection();
    this.commands = new Discord.default.Collection();
    this.slashCommands = new Discord.default.Collection(); 
  };
  /*========================================================
  # mongourl 
  ========================================================*/
  _mongodb(options) { 
    if(options.setConnectMongoDB) {
      mongoose.default.connect(options.setMongoDB, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      }).then(() => {
        console.log(`${switchLanguage("mongodb.connected")}`.blue);
      }).catch((err) => {
        console.error(`${switchLanguage("mongodb.error")}\n${err.stack}`.red);
      });
      mongoose.default.connection.on("disconnected", () => {
        console.warn(`${switchLanguage("mongodb.disconnected")}`.red);
      });
      mongoose.default.set('strictQuery', false);
    };
  };
  /*========================================================
  # interactionCretae
  ========================================================*/
  handlerInteractionCreate(options, client = this) {
    const { EmbedBuilder, PermissionsBitField, InteractionType } = require("discord.js");
    if(options.setHandlerInteraction) {
      console.log("interactionCreate ready".red);
      client.on("interactionCreate", async(interaction) => {
        if(interaction.type === InteractionType.ApplicationCommand) {
          if(!client.slashCommands.has(interaction.commandName) || !interaction.guild) return;
          const SlashCommands = client.slashCommands.get(interaction.commandName);
          if(!SlashCommands) return console.log(!SlashCommands);
          if(SlashCommands) {
            try {
              const embed = new EmbedBuilder().setTitle("Thiếu quyền sử dụng lệnh").setColor("Random");
              // dev commands
              if(SlashCommands.owner && options.setDeveloper.includes(interaction.user.id)) return interaction.reply({ 
                content: `Tôi, không phải là bot ngu ngốc, chỉ chủ sở hữu mới có thể sử dụng lệnh này`
              });
              // Các quyền của thành viên
              if(SlashCommands.userPerms) {
                if(!interaction.member.permissions.has(PermissionsBitField.resolve(SlashCommands.userPerms || []))) return interaction.reply({               
                  embeds: [embed.setDescription(`Xin lỗi, bạn không có quyền \`${SlashCommands.userPerms}\` trong <#${interaction.channelId}> để sử dụng lệnh \`${SlashCommands.name}\` này`)]
                });
              };
              // Đầu ra những lệnh đã được sử dụng
              console.log(`${SlashCommands.name} được sử dụng bởi ${interaction.user.tag} từ ${interaction.guild.name} (${interaction.guild.id})`);
              SlashCommands.run(client, interaction);
            } catch(error) {
              if(interaction.replied) return await interaction.editReplyinteraction.editReply({                                                                        
                embeds: [new EmbedBuilder().setDescription("Đã xảy ra lỗi khi thực hiện lệnh, xin lỗi vì sự bất tiện \`<3\`")], 
                ephemeral: true,
              }).catch(() => {});
              console.log(error);
            };
          };
        };
      });
    };
  };
  /*========================================================
  # messageCreate
  ========================================================*/
  handlerMessageCreate(options, client = this) {
    if(options.setHandlerMessageCreate) {
      console.log("messageCreate ready".red);
      client.on("messageCreate", (message) => {
        if(message.content === options.setPrefix + "ping2") {
          message.reply({ content: client.ws.ping + " ms" });
        };
      });
    };
  };
  /*========================================================
  # Commands
  ========================================================*/
  commandHandler(options, client = this) {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên file", "Tình trạng");
    const commandsPath = path_1.default.join(__dirname, options.setCommandPath);
    fs.default.readdirSync(commandsPath).forEach((dir) => {
      const commands = fs.default.readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`${commandsPath}/${dir}/${file}`);
        if(pull.name) {
          client.commands.set(pull.name, pull);
          tableCmds.addRow(file, '✔');
        } else {
          tableCmds.addRow(file, '❌ => thiếu help name');
          continue;
        };
        if(pull.aliases && Array.isArray(pull.aliases)) {
           pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        };
      };
    });
    this.handlerMessageCreate(options);
    console.log(tableCmds.toString().magenta);
  };
  /*========================================================
  # SlashCommands
  ========================================================*/
  slashHandler(options, client = this) {
    const SlashCmds = new ascii("BlackCat - Slash");
    SlashCmds.setHeading('Slash Commands', 'Trạng thái').setBorder('|', '=', "0", "0");
    const slashCommandsPath = path_1.default.join(__dirname, options.setSlashCommandPath);
    const data = [];
    fs.default.readdirSync(slashCommandsPath).forEach((dir) => {
      const slashCommandFile = fs.default.readdirSync(`${slashCommandsPath}/${dir}/`).filter((files) => files.endsWith(".js"));
      for (const file of slashCommandFile) {
        const slashCommand = require(`${slashCommandsPath}/${dir}/${file}`);
        client.slashCommands.set(slashCommand.name, slashCommand);
        if(slashCommand.name) {
				  SlashCmds.addRow(file.split('.js')[0], '✅')
			  } else {
					SlashCmds.addRow(file.split('.js')[0], '⛔')
			  };
        if(!slashCommand.name) return console.log("[slash] thiếu tên lệnh");
        if(!slashCommand.description) return console.log("[slash] thiếu mô tả lệnh");
        data.push({
          name: slashCommand.name,
          description: slashCommand.description,
          type: slashCommand.type,
          options: slashCommand.options ? slashCommand.options : null,
        });
      };
    });
    const rest = new Discord.default.REST({ version: "10" }).setToken(this.tokenBot);
    client.on("ready", () => {
      (async() => {
        try {
          await rest.put(Discord.default.Routes.applicationCommands(client.user.id), { 
             body: data
          });
          console.log(`[BlackCat-Club] Đã tải lại thành công lệnh (/).`.blue);
        } catch(err) {
          console.log(err);
        };
      })();
    });
    this.handlerInteractionCreate(options);
    console.log(SlashCmds.toString().red);
  };
  /*========================================================
  # khởi chạy các evets 
  ========================================================*/
  async eventHandler(options, client = this) {
    let Events = new ascii("Events");
    Events.setHeading("Tên file", "Trạng thái");
    const loadDir = (dir) => {
      let amount = 0, allevents = [];
      const EventsPath = path_1.default.join(__dirname, options.EventPath);
      const eventFiles = fs.default.readdirSync(`${EventsPath}/${dir}`).filter((file) => file.endsWith(".js"));
      for (const file of eventFiles) {
        try {
          const event = require(`${EventsPath}/${dir}/${file}`);
          let eventName = file.split(".")[0];
          allevents.push(eventName);
          client.on(eventName, event.bind(null, client));
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

module.exports = BlackCat;