const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Một cách để thông tin để mua sắm", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let result = await client.cs.info(message.member.id, message.guild.id);
    const embed = new EmbedBuilder().setDescription('thông tin về ' + `<@${message.member.id}>`);
    let unUsed = '';
    let cantBeUsed = '';
    for (const [key, value] of result.info) {
        if (value.used) unUsed += `- ${key}\n`;
        else cantBeUsed += `- ${key} ( ${value.timeLeft} )\n`;
    }
    embed.addFields([
        { name: 'Các lệnh kiếm tiền mà bạn có thể sử dụng:', value: unUsed || "Không có" },
        { name: 'Các lệnh mà bạn không thể sử dụng:', value: cantBeUsed ? cantBeUsed : "Không có" },
    ]);
    message.reply({
        embeds: [embed]
    });
  },
};