const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["balance"], // lệnh phụ
  description: "Xem số dư tài khoản của bạn", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const user = message.mentions.users.first() || message.author;
    let result = await client.cs.balance({
      user: user,
      guild: { id: null }
    });
    return message.reply({
      content: `${user.username}, Bạn có ${await client.cs.formatter(result.wallet)} trong ví và ${await client.cs.formatter(result.bank)} trong ngân hàng.`
    });
  },
};