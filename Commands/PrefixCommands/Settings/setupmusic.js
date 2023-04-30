const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const path = require("node:path");
const { Database } = require("st.db");
const { musicEmbedDefault } = require(`${process.cwd()}/Events/functions`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true
});
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
    channel.send(musicEmbedDefault(client, message.guild)).then(async(msg) => {
        const guildData = await database.get(message.guild.id);
        // Cập nhật thuộc tính setDefaultVolume với giá trị mới
        guildData.setDefaultMusicData.ChannelId = channel.id;
        guildData.setDefaultMusicData.MessageId = msg.id;
        // thiết lập thuộc tính với giá trị mới
        await database.set(message.guild.id, guildData);
        return message.reply({ content: ` **Thiết lập thành công Hệ thống Âm nhạc trong:** <#${channel.id}>` });
    });
  },
};