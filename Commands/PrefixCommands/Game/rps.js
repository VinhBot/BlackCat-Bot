const { RPSGame } = require(`${process.cwd()}/Events/Game`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["", ""], // lệnh phụ
  description: "", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Game", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    if(!message.mentions.users.first()) return message.reply("chỉ định ai đó");
    const noidungthachdau = `${args[0] ? args.join(" ") : "Không có nội dung thách đấu"}`;
    new RPSGame({
          message: message,
          slashCommand: false,
          opponent: message.mentions.users.first(),
          embed: {
            title: 'Oẳn tù tì',
            description: 'Nhấn một nút bên dưới để thực hiện một sự lựa chọn!,\n' + noidungthachdau,
            color: "Red",
          },
          buttons: {
            rock: 'Rock',
            paper: 'Paper',
            scissors: 'Scissors',
          },
          emojis: {
            rock: '🌑',
            paper: '📃',
            scissors: '✂️',
          },
          othersMessage: 'Bạn không được phép sử dụng các nút cho tin nhắn này!',
          chooseMessage: 'bạn chọn {emoji}!',
          noChangeMessage: 'Bạn không thể thay đổi lựa chọn của mình!',
          askMessage: 'Này {opponent}, {challenger} đã thách đấu bạn trong trò chơi Oẳn tù tì!\n' + noidungthachdau,
          cancelMessage: 'Có vẻ như họ từ chối chơi trò Oẳn tù tì. \:(',
          timeEndMessage: 'Vì đối thủ không trả lời, tôi đã bỏ trò chơi!',
          drawMessage: 'Đó là một trận hòa!',
          winMessage: '{winner} thắng trận đấu!',
          gameEndMessage: 'Trò chơi chưa hoàn thành :(',
    }).startGame();
  },
};