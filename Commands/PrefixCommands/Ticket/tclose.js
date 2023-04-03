const ticket = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");
const { 
  close 
} = new ticket.ticketHandler();

module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "đóng kênh ticket", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Ticket", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    return message.channel.send(await close(message, message.author));
  },
};