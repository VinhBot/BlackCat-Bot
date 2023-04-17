const { GiveawayClass } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "sử dụng lại giveaway", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Giveaway", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    if(!args[0]) return message.reply("Bạn vẫn chưa thêm id giveaway");
    const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === args[0] && g.guildId === message.guild.id);
    if(!giveaway) return message.reply(`Không thể tìm thấy giveaway cho messageId: ${args[0]}`);
    if(!giveaway.ended) return message.reply("Giveaway chưa kết thúc.");
    giveaway.reroll({
      messages: {
        congrat: ':tada: Người chiến thắng mới: {winners}! Chúc mừng bạn đã chiến thắng **{this.prize}**!\n{this.messageURL}',
        error: 'Không có sự tham gia hợp lệ, không thể chọn người chiến thắng mới!'
      }
    }).then(() => {
      return message.reply('Thành công! Giveaway đã được bắt đầu lại!').then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      });
    }).catch((err) => {
      return message.reply(`Lỗi, Vui lòng kiểm tra và thử lại.\n\`${err}\``);
    });
  },
};