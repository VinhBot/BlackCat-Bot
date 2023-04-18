const { EmbedBuilder } = require("discord.js");
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
    if($ === $$ && $ === $$$) {
      await client.cs.addMoney({ 
        user: message.author, // mention
        amount: moneyEarned * 2 - 0.5,
        wheretoPutMoney: "wallet"
      });
      setTimeout(async() => {
        message.reply({ content: `${message.author.tag} bạn đã thắng và bạn được cộng ${moneyEarned * 2} tiền` });
      }, 3000);
    } else if($$ !== $ && $$ !== $$$) {
      await client.cs.removeMoney({
        user: message.author,
        amount: moneyEarned,
        wheretoPutMoney: "wallet",
      });
      setTimeout(async() => {
        message.reply({ content: `${message.author.tag} bạn đã thua sml và bạn đã mất ${moneyEarned} tiền` });
      }, 3000);
    };
  },
};