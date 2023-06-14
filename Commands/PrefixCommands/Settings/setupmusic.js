const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const path = require("node:path");
const { musicEmbedDefault } = require(`${process.cwd()}/Events/functions`);
const { Music: database } = require(`${process.cwd()}/Assets/Schemas/database`);

module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["sums", "setupdefaultmusic"], // lệnh phụ
  description: "Thiết lập hệ thống âm nhạc cho channel", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Settings", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    var Emojis = [`0️⃣`, `1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`, `6️⃣`, `7️⃣`, `8️⃣`, `9️⃣`, `🔟`, `🟥`,`🟧`, `🟨`, `🟩`, `🟦`, `🟪`, `🟫`];
    let channel = message.mentions.channels.first();
    if(!channel) return message.reply({ content: `**Bạn quên ping một Text-Channel!**` });
    return channel.send(musicEmbedDefault(client, message.guild)).then(async(msg) => {
        const guildData = await database.findOne({ GuildId: message.guild.id, GuildName: message.guild.name });
        if(!guildData) return database.create({
          GuildId: message.guild.id, 
          GuildName: message.guild.name,
        }).then(() => {
          return message.reply({ content: "Đã tạo database" });
        });
        // Cập nhật thuộc tính setDefaultVolume với giá trị mới
        guildData.ChannelId = channel.id;
        guildData.MessageId = msg.id;
        guildData.save().then(() => {
          return message.reply({
            content: ` **Thiết lập thành công Hệ thống Âm nhạc trong:** <#${channel.id}>`
          });
        });
    });
  },
};