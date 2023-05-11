const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "thêm thành viên hoặc role vào kênh ticket", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Ticket", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    if(!args[0]) return message.reply("Vui lòng cung cấp id thành viên hoặc id role để thêm vào yêu cầu");
    const response = await client.addToTicket(message, args[0]);
    message.reply(response);
  },
};