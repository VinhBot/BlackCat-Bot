const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Một cách để kiếm tiền, hafly", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let result = await client.cs.hafly({
        user: message.author,
        guild: { id: null },
        amount: 100,
    }); 
    if(result.error) {
      return message.reply({ content: `Gần đây bạn đã sử dụng hafly Thử lại trong ${result.time}` });
    } else return message.reply({ content: `Bạn đã kiếm được ${await client.cs.formatter(result.amount)}. (${result.rawData.streak.hafly})` });
  },
};