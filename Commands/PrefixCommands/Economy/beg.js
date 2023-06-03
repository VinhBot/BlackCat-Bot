const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Một cách để kiếm tiền beg", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let result = await client.cs.beg({
        user: message.author,
        guild: { id: null },
        minAmount: 100,
        maxAmount: 1000,
        cooldown: 10 // 10 giây
    });
    if(result.error) {
      return message.reply({ content: `Gần đây bạn đã beg Hãy thử lại sau ${result.time}`});
    } else message.reply({ content: `Bạn đã kiếm được ${await client.cs.formatter(result.amount)}.` });
  },
};