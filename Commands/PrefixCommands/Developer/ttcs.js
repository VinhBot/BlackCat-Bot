const Database = require(`${process.cwd()}/Assets/Schemas/defalultDatabase`);
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
    Database.findOne({ GuildId: message.guild.id, GuildName: message.guild.name }).then(async(data) => {
      if(!data) return Database.create({
        GuildId: message.guild.id, 
        GuildName: message.guild.name
      }).then(() => {
        return message.reply({
          content: "Đã tạo database"
        });
      });

      if(data) {
        const databs = await Database.findOne({
          GuildId: message.guild.id, 
          GuildName: message.guild.name 
        });
        // 
        databs.setDiaryChannel.voiceStateUpdate = "11223344";
        // 
        Database.findOneAndUpdate({ GuildId: message.guild.id, GuildName: message.guild.name }, {
          $set: databs
        }).then(() => {
          return message.reply({
            content: "Đã cập nhật database"
          });
        });
      };
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  }, 
};