const Database = require(`${process.cwd()}/Assets/Schemas/logChannels`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["tts"], // lệnh phụ
  description: "", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const data = await Database.findOne({ GuildId: message.guild.id, GuildName: message.guild.name });
    // tạo database
    if(!data) return Database.create({
      GuildId: message.guild.id, 
      GuildName: message.guild.name
    }).then(() => {
      return message.reply({ content: "Đã tạo database" });
    });
    
    if(data) {
      data.channelDelete = "1112060619005362196"
      data.save().then(() => {
        return message.reply({
          content: "Đã cập nhật database"
        });
      });
    };

  }, 
};