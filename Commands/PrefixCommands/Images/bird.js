const { baseURL } = require(`${process.cwd()}/Events/functions`);
const { EmbedBuilder } = require("discord.js");
const path = require("node:path");

module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xem hình ảnh của con 🐦", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Images", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const response = await baseURL(`https://some-random-api.ml/animal/bird`);
    if(!response.success) return message.reply({ content: "Có lỗi sảy ra vui lòng thử lại sau" });
    return message.reply({ embeds: [new EmbedBuilder()
      .setColor("Random")
      .setImage(response.data?.image)
      .setFooter({ text: `yêu cầu bởi ${message.author.id}` })
    ]});
  },
};