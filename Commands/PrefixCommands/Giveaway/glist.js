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
    const giveaway = new GiveawayClass(client);
    const give = await giveaway.list(message.member);
    return message.reply(give);
  },
};