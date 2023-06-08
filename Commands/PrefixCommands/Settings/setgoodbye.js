const database = require(`${process.cwd()}/Assets/Schemas/welcomeGoodbye`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Thiết lập kênh goodbye cho guilds", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const data = await database.findOne({
      GuildId: message.guild.id,
      GuildName: message.guild.name
    });
    if(!data) return database.create({
      GuildId: message.guild.id,
      GuildName: message.guild.name
    }).then(() => {
      return message.reply({
        content: "Đã tạo database vui lòng chạy lại lệnh"
      });
    });

    const newChannel = message.mentions.channels.first();
    if(!newChannel) return message.reply({
      content: "Vui lòng đề cập đến channel bạn muốn thiết lập"
    });
    data.GoodbyeChannel = newChannel.id;
    data.save().then(() => {
      return message.reply({
        content: `Đã thiết lập goodbyeChannel ở <#${newChannel.id}>`
      });
    }).catch((e) => console.log(e));
  },
};