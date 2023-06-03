const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["mua"], // lệnh phụ
  description: "Mua đồ trong cửa hàng", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let thing = args[0];
    if(!thing) return message.reply("Vui lòng cung cấp số mặt hàng");
    if(isNaN(thing)) return message.reply("Vui lòng cung cấp số mặt hàng hợp lệ");
    let result = await client.cs.buy({
      user: message.author,
      guild: { id: null },
      item: parseInt(thing),
      amount: args[1] || 1,
    });
    if(result.error) {
      if(result.type === "No-Item") return message.reply("Vui lòng cung cấp số mặt hàng hợp lệ");
      if(result.type === "Invalid-Item") return message.reply("mục không tồn tại");
      if(result.type === "low-money") return message.reply(`**Bạn không có đủ số dư để mua mặt hàng này!**`);
      if(result.type === "Invalid-Amount") return message.channel.send("Không thể thêm ít hơn 1 mục.");
    } else return message.reply(`**Mua thành công ${args[1] || 1} \`${result.inventory.name}\` với giá $${result.price}**`);
  },
};