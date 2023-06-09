const { ChannelType } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Thiết lập và bắt đầu giveaway", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Giveaway", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let channel = message.mentions.channels.first();
    if(!channel.type === ChannelType.GuildText) return message.reply({ content: "Bạn chỉ có thể bắt đầu giveaway trong các kênh văn bản." });
    if(!channel) return message.reply({ content: "Bạn quên chưa ping kênh channel" });
    return await client.giveawaysManager.runModalSetup(message, channel);
  },
};