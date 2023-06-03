const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Kiếm tiền làm việc của bạn", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let result = await client.cs.work({
      user: message.author,
      maxAmount: 100,
      guild: { id: null },
      replies: ['Programmer', 'Builder', 'Waiter', 'Busboy', 'Chief', 'Mechanic'],
      cooldown: 25 //25 giây,
    });
    if (result.error) {
      return message.reply({ content: `Gần đây bạn đã làm việc xong Thử lại sau ${result.time}` });
    } else message.reply(`Bạn đã làm việc như một ${result.workType} và kiếm được ${await client.cs.formatter(result.amount)}.`)
  },
};