const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xoá tiền của người dùng", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"Developer", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const user = message.mentions.users.first() || message.author;
    let wheretoPutMoney = args[1];
    let amount = args[2];
    let result = await client.cs.removeMoney({
      user: user,
      amount: amount,
      guild: { id: null },
      wheretoPutMoney: wheretoPutMoney,
    });
    if(result.error) {
      return message.reply({ content: "Bạn không thể xóa tiền âm" });
    } else message.reply(`Đã xóa thành công ${amount === "all" ? "toàn bộ tiền" : `${await client.cs.formatter(amount)}`} của ${user.username}.`);
  },
};