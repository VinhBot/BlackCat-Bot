const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const { musicEmbedDefault } = require(`${process.cwd()}/Events/functions`);
const musicDb = require(`${process.cwd()}/Assets/Schemas/music`);

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
    },
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "music") {
      let channel = interaction.options.getChannel("channel");
      channel.send(musicEmbedDefault(client, interaction.guild)).then(async(msg) => {
        const guildData = musicDb.findOne({ GuildId: interaction.guild.id });
        guildData.setDefaultMusicData.ChannelId = channel.id;
        guildData.setDefaultMusicData.MessageId = msg.id;
        guildData.save().then(() => {
          return interaction.reply({ content: `**Thiết lập thành công Hệ thống Âm nhạc trong:** <#${channel.id}>` });
        });
      });
    };
  },
};