const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xem thông tin về emoji nào đó", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Infomation", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let Emojis = "";
    let EmojisAnimated = "";
    let EmojiCount = 0;
    let Animated = 0;
    let OverallEmojis = 0;
    message.guild.emojis.cache.forEach((emoji) => {
      OverallEmojis++;
      if(emoji.animated) {
        Animated++;
        EmojisAnimated += client.emojis.cache.get(emoji.id).toString();
      } else {
        EmojiCount++;
        Emojis += client.emojis.cache.get(emoji.id).toString();
      }
    });
    return message.reply({
      embeds:[new EmbedBuilder() 
        .setTitle("Tổng số emoji của " + message.guild.name)
        .setDescription(`Có ${OverallEmojis} emojis`)
        .addFields([
          { name: `emoji động [${Animated}]`, value: EmojisAnimated.substr(0, 1021) ? EmojisAnimated.substr(0, 1021) + "..." : "Không có", inline: false },
          { name: `emojj tĩnh [${EmojiCount}]`, value: Emojis.substr(0, 1021) ? Emojis.substr(0, 1021) + "..." : "Không có", inline: false },
        ])
    ]});
  },
};