const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["inv"], // lệnh phụ
  description: "Xem trong kho bạn có món hàng gì", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category: "Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let result = await client.cs.getUserItems({
      user: message.author,
      guild: { id: null },
    });
    let inv = result.inventory.slice(0, 10);
    const embed = new EmbedBuilder().setDescription("Kho đồ của bạn trống rỗng!");
    let arr = [];
    for (key of inv) {
      arr.push({ name: `**${key.name}:**`, value: `Số lượng: ${key.amount}` });
      embed.setDescription("Kho đồ của bạn!");
    };
    embed.addFields(arr);
    return message.reply({ embeds: [embed] });
  },
};