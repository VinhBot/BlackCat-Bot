const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const { musicEmbedDefault } = require(`${process.cwd()}/Events/functions`);
const { Database } = require("st.db");
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true
});
module.exports = {
  name: "setup", // Tên lệnh 
  description: "Thiết lập commands", // Mô tả lệnh
  userPerms: ["Administrator"], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "music", 
      description: "Thiết lập hệ thống âm nhạc dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "channel", 
        description: "Kênh văn bản bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.Channel,
        required: true
      }],
    },{ 
      name: "welcome_goodbye", 
      description: "Thiết lập kênh welcome, goodbye dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
          name: "welcome", 
          description: "Vui lòng chọn channel bạn muốn thiết lập kênh chào mừng", 
          type: ApplicationCommandOptionType.Channel,
          required: false
      },{
          name: "goodbye", 
          description: "Vui lòng chọn channel bạn muốn thiết lập kênh tạm biệt", 
          type: ApplicationCommandOptionType.Channel,
          required: false
      }],
    },{ 
      name: "prefix", 
      description: "Thiết lập prefix dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "newprefix", 
        description: "Prefix bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.String,
        required: true
      }],
    },{ 
      name: "default_volume", 
      description: "Thiết lập default volume dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "volume", 
        description: "số volume mà bạn muốn thiết lập (1 => 150)", 
        type: ApplicationCommandOptionType.Number,
        required: true
      }],
    },{ 
      name: "default_autoresume", 
      description: "Thiết lập default autoresume dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "settings", 
        description: "tính năng mà bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Bật", value: "1" },
          { name: "Tắt", value: "2" }
        ],
      }],
    },{ 
      name: "default_autolay", 
      description: "Thiết lập default autoplay dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "settings", 
        description: "tính năng mà bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Bật", value: "1" },
          { name: "Tắt", value: "2" }
        ],
      }],
    },{ 
      name: "create_voice", 
      description: "Thiết lập tự động tạo voice dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "channel", 
        description: "kênh voice bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.Channel,
        required: true
      }],
    },
  ],
  run: async(client, interaction) => {
    let guildData = await database.get(interaction.guild.id);
    if(interaction.options.getSubcommand() === "prefix") {
       const newPrefix = interaction.options.getString("newprefix");
       guildData.setDefaultPrefix = newPrefix;
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Prefix đã được đặt thành ${newPrefix}` });
    } else if(interaction.options.getSubcommand() === "welcome_goodbye") {
       const welcome = interaction.options.getChannel("welcome");
       const goodbye = interaction.options.getChannel("goodbye");
       if(welcome) {
         guildData.setDefaultWelcomeGoodbyeData.WelcomeChannel = welcome.id;
         interaction.reply({ content: `Kênh welcome của bạn đã được đặt ở ${welcome}` });
       } else if(goodbye) {
         guildData.setDefaultWelcomeGoodbyeData.GoodbyeChannel = goodbye.id;
         interaction.reply({ content: `Kênh goodbye của bạn đã được đặt ở ${goodbye}` });
       };
       await database.set(interaction.guild.id, guildData);
    } else if(interaction.options.getSubcommand() === "default_volume") {
       const newVolume = interaction.options.getNumber("volume");
       guildData.setDefaultMusicData.DefaultVolume = newVolume;
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Volume mặc định của guilds sẽ là ${newVolume}` });
    } else if(interaction.options.getSubcommand() === "default_autoresume") {
       const settings = interaction.options.getString("settings");
       if(settings === "1") {
         guildData.setDefaultMusicData.DefaultAutoresume = Boolean(true);
       } else if(settings === "2") {
         guildData.setDefaultMusicData.DefaultAutoresume = Boolean(false);
       };
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Đã thiết lập chế độ Autoresume cho guilds thành: ${settings}` });
    } else if(interaction.options.getSubcommand() === "default_autoplay") {
       const settings = interaction.options.getString("settings");
       if(settings === "1") {
         guildData.setDefaultMusicData.DefaultAutoplay = Boolean(true);
       } else if(settings === "2") {
         guildData.setDefaultMusicData.DefaultAutoplay = Boolean(false);
       };
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Đã thiết lập chế độ autoplay cho guilds thành: ${settings}` });
    } else if(interaction.options.getSubcommand() === "create_voice") {
      const voiceChannel = interaction.options.getChannel("channel");
      guildData.setDefaultMusicData.ChannelAutoCreateVoice = voiceChannel.id;
      await database.set(interaction.guild.id, guildData);
      return interaction.reply({ content: `Đã thiết lập thành công voiceChannel` });
    } else if(interaction.options.getSubcommand() === "music") {
      let channel = interaction.options.getChannel("channel");
      channel.send(musicEmbedDefault(client, interaction.guild)).then(async(msg) => {
        guildData.setDefaultMusicData.ChannelId = channel.id;
        guildData.setDefaultMusicData.MessageId = msg.id;
        await database.set(interaction.guild.id, guildData);
        return interaction.reply({ content: `**Thiết lập thành công Hệ thống Âm nhạc trong:** <#${channel.id}>` });
      });
    };
  },
};