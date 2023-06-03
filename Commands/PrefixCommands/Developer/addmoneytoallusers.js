const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Một cách để thêm số tiền trong ngân hàng hoặc ví của mọi người", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"Developer", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let wheretoPutMoney = args[1];
    if(wheretoPutMoney) {
      wheretoPutMoney = 'bank';
    } else wheretoPutMoney = 'wallet';
    let amount = args[0]
    let money = parseInt(amount);
    let result = await client.cs.addMoneyToAllUsers({
        guild: { id: null },
        amount: money,
        wheretoPutMoney: wheretoPutMoney
    });
    if(result.error) {
      if(result.type === 'negative-money') return message.reply("Bạn không thể thêm tiền âm");
      else return message.reply('Không tìm thấy người dùng');
    } else message.reply(`Đã thêm thành công $${money} vào ${result.rawData.length} thành viên!, (${wheretoPutMoney})`)
  },
};