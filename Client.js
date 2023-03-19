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
    // kết nối tới mongodb 
    this._mongodb(options);
  };
  init() {
    this.aliases = new Collection();
    this.commands = new Collection();
    this.slashCommands = new Collection(); 
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
  constructor(defaultClient, options) {
    this.client = defaultClient;
    this.handlerReadyEvents(options);
  };
  handlerReadyEvents(options, client = this.client) {
    client.on("ready", () => {
      console.log(`${client.user.username} đã sẵn sàng hoạt động`.red); 
      setInterval(() => {
        client.user.setPresence({
          activities: [{ 
            name: options.setStatus[Math.floor(Math.random() * options.setStatus.length)], 
            type: ActivityType.Watching 
          }],
          status: 'dnd',
        });
  	  }, 5000);
    });
  };
  // interactionCretae
  handlerInteractionCreate(options, client = this.client) {
    const { EmbedBuilder, PermissionsBitField, InteractionType } = require("discord.js");
    if(options.setHandlerInteraction) {
      console.log("Bạn đang sử dụng interactionCreate của BlackCat-djs".red);
      client.on("interactionCreate", async(interaction) => {
        if(interaction.type === InteractionType.ApplicationCommand) {
          if(!client.slashCommands.has(interaction.commandName) || !interaction.guild) return;
          const SlashCommands = client.slashCommands.get(interaction.commandName);
          if(!SlashCommands) return;
          if(SlashCommands) {
            try {
              const embed = new EmbedBuilder().setTitle("Thiếu quyền sử dụng lệnh").setColor("Random");
              // dev commands
              if(SlashCommands.owner && options.setDeveloper.includes(interaction.user.id)) return interaction.reply({ 
                content: `Tôi, không phải là bot ngu ngốc, chỉ chủ sở hữu mới có thể sử dụng lệnh này`
              });
              // Các quyền của thành viên
              if (SlashCommands.userPerms) {
                if(!interaction.member.permissions.has(PermissionsBitField.resolve(SlashCommands.userPerms || []))) return interaction.reply({               
                  embeds: [embed.setDescription(`Xin lỗi, bạn không có quyền \`${SlashCommands.userPerms}\` trong <#${interaction.channelId}> để sử dụng lệnh \`${SlashCommands.name}\` này`)]
                });
              };  
              // Đầu ra những lệnh đã được sử dụng
              console.log(`${SlashCommands.name} được sử dụng bởi ${interaction.user.tag} từ ${interaction.guild.name} (${interaction.guild.id})`);
              SlashCommands.run(client, interaction);
            } catch(error) {
              if(interaction.replied) {
                return await interaction.editReplyinteraction.editReply({                                                                        
                  embeds: [new EmbedBuilder().setDescription("Đã xảy ra lỗi khi thực hiện lệnh, xin lỗi vì sự bất tiện \`<3\`")], 
                  ephemeral: true,
                }).catch(() => {});
              } else return await interaction.followUp({
                embeds: [new EmbedBuilder().setDescription("Đã xảy ra lỗi khi thực hiện lệnh, xin lỗi vì sự bất tiện \`<3\`")], 
                ephemeral: true 
              }).catch(() => {});
              console.log(error);
            };
          };
        };
      });
    };
  };
  // messageCreate
  handlerMessageCreate(options, client = this.client) {
    if(options.setHandlerMessageCreate) {
      console.log("Bạn đang sử dụng messageCreate của BlackCat-djs".red);
      client.on("messageCreate", (message) => {
        if(message.content === options.setPrefix + "ping2") {
          message.reply({ content: client.ws.ping + " ms" });
        };
      });
    };
  };
  /*========================================================
  # Ready Commands/ Slash/ Events
  ========================================================*/
  // Commands
  commandHandler(options, client = this.client) {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên file", "Tình trạng");
    const commandsPath = path.join(__dirname, options.setCommandPath);
    readdirSync(commandsPath).forEach((dir) => {
      const commands = readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith(".js"));
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
  // SlashCommands
  slashHandler(options, client = this.client) {
    const SlashCmds = new ascii("BlackCat - Slash");
    SlashCmds.setHeading('Slash Commands', 'Trạng thái').setBorder('|', '=', "0", "0");
    const slashCommandsPath = path.join(__dirname, options.setSlashCommandPath);
    const data = [];
    readdirSync(slashCommandsPath).forEach((dir) => {
      const slashCommandFile = readdirSync(`${slashCommandsPath}/${dir}/`).filter((files) => files.endsWith(".js"));
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
    const rest = new REST({ version: "10" }).setToken(options.setToken);
    client.on("ready", async() => {
      (async() => {
        try {
          await rest.put(Routes.applicationCommands(client.user.id), { body: data });
          console.info(`[BlackCat-Club] Đã tải lại thành công lệnh (/).`.blue);
        } catch(error) {
          return console.info(error);
        };
      })();
    });
    this.handlerInteractionCreate(options);
    console.log(SlashCmds.toString().red);
  };
  async eventHandler(options, client = this.client) {
    let Events = new ascii("Events");
    Events.setHeading("Tên file", "Trạng thái");
    const loadDir = (dir) => {
      let amount = 0, allevents = [];
      const EventsPath = path.join(__dirname, options.EventPath);
      const eventFiles = readdirSync(`${EventsPath}/${dir}`).filter((file) => file.endsWith(".js"));
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

module.exports = {
  Client: BlackCat,
  optionHandlerEvents
};