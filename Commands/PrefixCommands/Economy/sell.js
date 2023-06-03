const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Một cách để bán đồ", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    if (!args[0]) return message.reply("Bán bỏ mục nào?");
    let amount = 1;
    if(args[1] && args[1]) amount = args[1];
    let result = await client.cs.removeUserItem({
      user: message.author,
      guild: { id: null },
      item: parseInt(args[0]),
      amount: amount,
    });
    if(result.error) {
      if(result.type == "Invalid-Item-Number") return message.reply("Đã xảy ra lỗi, Vui lòng nhập số mục để bán.!");
      if(result.type == "Unknown-Item") return message.reply("Đã xảy ra lỗi, Mục không tồn tại!");
      if(result.type == "Invalid-Amount") return message.reply("Số mục cần bán không hợp lệ.");
      if(result.type == "Negative-Amount") return message.reply("Không thể Xóa Ít hơn 1 mục!");
    } else return message.reply(`Xong! Đã bán thành công \`${result.inventory.deleted}\` của \`${result.inventory.name}\`! Bạn hiện còn lại \`${result.inventory.count}\` trong số các mặt hàng đó!`);
  },
};