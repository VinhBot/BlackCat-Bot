const { GiveawayClass } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "tiếp tục chạy giveaway", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Giveaway", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    if(!args[0]) return message.reply("Bạn vẫn chưa thêm id giveaway");
    const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === args[0] && g.guildId === message.guild.id);
    if(!giveaway) return message.reply(`Không thể tìm thấy giveaway cho messageId: ${args[0]}`);
    if(!giveaway.pauseOptions.isPaused) return message.reply("Giveaway này không bị tạm dừng.");
    giveaway.unpause().then(() => {
      return message.reply('Thành công! Giveaway đã được tiếp tục!').then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      });
    }).catch((err) => {
      return message.reply(`Lỗi, Vui lòng kiểm tra và thử lại.\n\`${err}\``);
    });
  },
};