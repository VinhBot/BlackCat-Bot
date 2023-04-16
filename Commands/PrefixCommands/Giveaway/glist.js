const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xem danh sách giveaway", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Giveaway", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const giveaways = client.giveawaysManager.giveaways.filter((g) => g.guildId === message.guild.id && g.ended === false);
    if(giveaways.length === 0) return message.reply("Không có giveaway nào chạy trong máy chủ này.");
    const embeds = new EmbedBuilder().setColor("Random");
    giveaways.map((g, i) => embeds.addFields({ name: `#${i + 1}. Channel: <#${g.channelId}>`, value: `Phần thưởng: ${g.prize}`, inline: true }));
    return message.reply({
      embeds: [embeds]
    });
  },
};