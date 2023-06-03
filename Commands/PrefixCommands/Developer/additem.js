const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Thêm mặt hàng vào shopp", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"Developer", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const itemName = args[0];
    if(!itemName) return message.reply("Vui lòng thêm tên sản phẩm");
    const itemPrice = Number(args[1]);
    if(!itemPrice || isNaN(itemPrice)) return message.reply("Vui lòng thêm giá tiền hoặc chỉ định số tiền hợp lệ");
    const itemDescription = args[2];
    let result = await client.cs.addItem({
        guild: { id: null },
        inventory: {
            name: itemName,
            price: itemPrice,
            description: itemDescription ? itemDescription : "Không có mô tả"
        }
    });
    if(result.error) {
      if(result.type == 'No-Inventory-Name') return message.reply('Đã xảy ra lỗi, Vui lòng nhập tên mục để thêm.!')
      if(result.type == 'Invalid-Inventory-Price') return message.reply('Đã xảy ra lỗi, giá không hợp lệ!')
      if(result.type == 'No-Inventory-Price') return message.reply('Đã xảy ra lỗi, Bạn không chỉ định giá!')
      if(result.type == 'No-Inventory') return message.reply('Đã xảy ra lỗi, Không nhận được dữ liệu!')
    } else return message.reply('Xong! Thêm thành công vào cửa hàng!')
  },
};