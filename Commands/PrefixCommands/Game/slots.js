const { Slots } = require(`${process.cwd()}/Events/Game`);
const { EmbedBuilder } = require("discord.js");
const path = require("node:path");

module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Slots Game", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Game", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let user = await client.cs.balance({ 
      user: message.author
    });
    const checkMoney = new EmbedBuilder()
      .setColor("Random")
      .setTimestamp()
      .setDescription(`Sử dụng lệnh không hợp lệ\nVui lòng sử dụng ${prefix + path.parse(__filename).name} <Số tiền>`)
    let moneyEarned = parseInt(args[0]);
    if(moneyEarned > user.wallet) return message.reply({ embeds: [checkMoney.setDescription("Bạn không có nhiều tiền trong ví của mình")]});
    if(!moneyEarned) return message.reply({ embeds: [checkMoney] });
    if(moneyEarned < 1) return message.reply({ embeds: [checkMoney.setDescription("Vui lòng chỉ định một số cao hơn \`1\`")]});
    if(moneyEarned > 30000) return message.reply({ embeds: [checkMoney.setDescription("Vui lòng chỉ định một số nhỏ hơn \`30.000\`")]});
    if(isNaN(args[0])) return message.reply({ embeds: [checkMoney.setDescription("Vui lòng chỉ định một số hợp lệ!")]});

    const Game = new Slots(client, {
      message: message,
      slashCommands: false,
      moneyNumber: moneyEarned,
      embed: {
         title: 'Slot Machine',
         color: '#5865F2'
      },
      slots: ['🍇', '🍊', '🍋', '🍌']
    });
    Game.startGame();
  },
};