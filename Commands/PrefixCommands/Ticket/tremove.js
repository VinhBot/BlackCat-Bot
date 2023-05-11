const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xoá thành viên hoặc role ra khỏi ticket", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Ticket", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    if(!args[0]) return message.reply("Vui lòng cung cấp thành viên hoặc role để xóa");
    let inputId;
    if(message.mentions.users.size > 0) {
      inputId = message.mentions.users.first().id;
    } else if(message.mentions.roles.size > 0) {
      inputId = message.mentions.roles.first().id;
    } else inputId = args[1];
    const response = await client.removeFromTicket(message, inputId);
    message.reply(response);
  },
};