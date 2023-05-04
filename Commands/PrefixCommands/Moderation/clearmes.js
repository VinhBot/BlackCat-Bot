const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["clearmessage", "clmessage"], // lệnh phụ
  description: "Xoá tin nhắn theo yêu cầu", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Moderation", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const amount = Number(args[0]);
    if(amount < 1 || amount > 99) return await message.reply({ 
        embeds: [new EmbedBuilder()
          .setTitle("Lỗi")
          .setDescription("Bạn chỉ có thể xóa từ 1 đến 99 tin nhắn.")
          .setColor("Red")
        ]
    });
    await message.channel.bulkDelete(amount, true).then(async() => {
        return message.channel.send({
          embeds: [new EmbedBuilder()
            .setTitle("Xoá thành công")
            .setDescription(`Đã xóa thành công ${amount} tin nhắn.`)
            .setColor("Random")
          ]
        });
    });
  },
};