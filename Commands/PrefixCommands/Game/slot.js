const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: [""], // lệnh phụ
  description: "Chơi game slot", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Game", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const slotemoji = ":money_mouth:"; 
    let items = ['💵', '💍', '💯'];
    let $ = items[Math.floor(items.length * Math.random())];
    let $$ = items[Math.floor(items.length * Math.random())];
    let $$$ = items[Math.floor(items.length * Math.random())];
    spinner = await message.channel.send({ content: "• " + slotemoji + "  " + slotemoji + "  " + slotemoji + " •" })
    setTimeout(() => {
      spinner.edit({ content: "• " + $ + "  " + slotemoji + "  " + slotemoji + " •" });
    }, 600);
    setTimeout(() => {
      spinner.edit({ content: "• " + $ + "  " + $$ + "  " + slotemoji + " •" });
    }, 1200);
    setTimeout(() => {
      spinner.edit({ content: "• " + $ + "  " + $$ + "  " + $$$ + " •" });
    }, 1800);  
    if ($ === $$ && $ === $$$) {
      setTimeout(async() => {
        message.reply({ content: `${message.author.tag} bạn đã thắng` });
      }, 3000);
    } else if($$ !== $ && $$ !== $$$) {
      setTimeout(async() => {
        message.reply({ content: `${message.author.tag} bạn đã thua sml` });
      }, 3000);
    };
  },
};