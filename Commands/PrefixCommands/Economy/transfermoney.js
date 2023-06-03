const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["give"], // lệnh phụ
  description: "Chuyển tiền cho thành viên hoặc bạn của bạn", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const user = message.mentions.users.first();
    let amount = args[1];
    if (!amount) return message.reply("Enter amount of money to add.");
    if (String(amount).includes("-")) return message.reply("Bạn không thể gửi tiền âm.")
    let money = parseInt(amount);
    let result = await client.cs.transferMoney({
      user: message.author,
      user2: user,
      guild: { id: null },
      amount: money
    });
    try {
      if(result.error) {
        return message.reply({ 
          content: `Bạn không có đủ tiền trong ví.`
        });
      } else message.reply({ 
        content: `**${message.author.username}**, Đã chuyển thành công **${await client.cs.formatter(result.money)}** cho **${result.user2.username}**`
      });
    } catch(ex) {
      return message.reply({ content: "Thành viên chưa có trong cơ sở dữ liệu, Đã tạo dữ liệu thành viên :))" });
    };
  },
};