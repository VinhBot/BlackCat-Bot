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
    let data = await client.cs.leaderboard(null);
    if(data.length < 1) return message.reply("Chưa có ai trong bảng xếp hạng.");
    const msg = new EmbedBuilder();
    let pos = 0;
    // Điều này là để có được 10 người dùng đầu tiên )
    let arr = [];
    data.slice(0, 10).map((e) => {
      if(!client.users.cache.get(e.userID)) return;
      pos++;
      arr.push({
        name: `${pos} - **${client.users.cache.get(e.userID).username}**`,
        value: `Wallet: **${e.wallet}** - Bank: **${e.bank}**`,
        inline: true,
      });
    });
    msg.addFields(arr);
    message.reply({ embeds: [msg] }).catch();
  },
};