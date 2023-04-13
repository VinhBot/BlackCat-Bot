const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Thêm tiền cho thành viên", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"Developer", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const user = message.mentions.users.first();
    const money = parseInt(args[1]);
    let result = await client.cs.addMoney({ 
      user: user, // mention
      amount: money,
      wheretoPutMoney: "wallet"
    });
    if(result.error) {
      return message.reply({ content: "Bạn không thể thêm tiền âm" });
    } else message.reply({ content: `Đã thêm thành công ${await client.cs.formatter(money)} vào ${user.username}.` });
  },
};