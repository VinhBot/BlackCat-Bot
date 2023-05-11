const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "xoá tất cả các kênh ticket", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Ticket", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let sent = await message.reply("Đóng tickets ...");
    const response = await client.ticketCloseAll(message, message.author);
    return sent.editable ? sent.edit(response) : message.channel.send(response);
  },
};