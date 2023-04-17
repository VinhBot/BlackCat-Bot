const { Slots } = require(`${process.cwd()}/Events/Game`);
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
    const Game = new Slots(client, {
      message: message,
      isSlashGame: false,
      embed: {
         title: 'Slot Machine',
         color: '#5865F2'
      },
      slots: ['🍇', '🍊', '🍋', '🍌']
    });
    Game.startGame();
  },
};