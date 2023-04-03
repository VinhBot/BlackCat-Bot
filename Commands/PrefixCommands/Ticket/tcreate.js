const ticket = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");
const { 
  ticketModalSetup
} = new ticket.ticketHandler();
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Khởi tạo kênh ticket", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Ticket", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let ChannelId = message.mentions.channels.first();
    if(!ChannelId) return message.reply({ content: `**Bạn quên ping một Text-Channel!**` });
    return ticketModalSetup(message, ChannelId);
  },
};