const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["ldb", "ebxh"], // lệnh phụ
  description: "Xem danh sách các đại gia :)))", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let data = await client.cs.globalLeaderboard();
    if (data.length < 1) return message.reply("Chưa có ai trong bảng xếp hạng.");
    const msg = new EmbedBuilder();
    msg.setTitle("Bảng xếp hàng người có tiền");
    msg.setColor("Random");
    let pos = 0;
    data.slice(0, 10).map(async(e) => {
      pos++;
      msg.addFields({ name: `${pos} - **${e.userName}**`, value: `Wallet: **${e.wallet}** - Bank: **${e.bank}**`, inline: true });
     // msg.addFields({ name: `${pos} - **${e.userName}**`, value: `Wallet: **${await client.cs.formatter(e.wallet)}** - Bank: **${await client.cs.formatter(e.bank)}**`, inline: true });
    });
    return message.reply({ embeds: [msg] }).catch();
  },
};