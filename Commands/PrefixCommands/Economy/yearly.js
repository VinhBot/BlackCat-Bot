const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Lấy tiền hàng năm của bạn", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let result = await client.cs.yearly({
      user: message.author,
      guild: { id: null },
      amount: 27000,
    });
    if(result.error) {
      return message.reply({ content: `Bạn đã sử dụng yearly gần đây Hãy thử lại sau ${result.time}` });
    } else message.reply({ content: `Bạn đã kiếm được ${await client.cs.formatter(result.amount)}. (${result.rawData.streak.yearly})` });
  },
};