const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["mly"], // lệnh phụ
  description: "Lấy số tiền hàng tháng của bạn", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let result = await client.cs.monthly({
        user: message.author,
        guild: { id: null },
        amount: 6000,
    });
    if(result.error) {
      return message.reply({ content: `Bạn đã sử dụng monthly gần đây Thử lại sau ${result.time}` });
    } else message.reply({ content: `Bạn đã kiếm được ${await client.cs.formatter(result.amount)}. (${result.rawData.streak.monthly})` });
  },
};