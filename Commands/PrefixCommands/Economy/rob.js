const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Cướp tiền của ai đó", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Economy", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const user = message.mentions.users.first();
    if(user.bot) return message.reply({ content: "Người dùng này là bot." });
    if(!user) return message.reply({ content: 'Xin lỗi, bạn đã quên đề cập đến ai đó.' });
    let result = await client.cs.rob({
      user: message.author,
      user2: user,
      guild: { id: null },
      minAmount: 100,
      successPercentage: 5,
      cooldown: 25, //25 giây,
      maxRob: 1000
    });
    if(result.error) {
      if(result.type === 'time') return message.reply({ content: `Gần đây bạn đã bị cướp Thử lại sau ${result.time}` });
      if(result.type === 'low-money') return message.reply({ content: `Bạn cần ít nhất ${await client.cs.formatter(result.minAmount)} cướp ai đó.` });
      if(result.type === 'low-wallet') return message.reply({ content: `${result.user2.username} có ít hơn ${await client.cs.formatter(result.minAmount)} để cướp.` });
      if(result.type === 'caught') return message.reply({ content: `${message.author.username} đã cướp ${result.user2.username} và đã bị bắt và đã phải trả lại ${await client.cs.formatter(result.amount)} cho ${result.user2.username}!` });
    } else {
      if(result.type === 'success') return message.reply({ content: `${message.author.username} bạn bị cướp bởi ${result.user2.username} và đã bị cướp mất ${await client.cs.formatter(result.amount)}` });
    };
  },
};