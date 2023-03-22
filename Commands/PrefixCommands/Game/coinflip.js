const { ButtonBuilder, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle } = require("discord.js");
const database = require(`${process.cwd()}/Events/Json/database.json`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["", ""], // lệnh phụ
  description: "chơi game tung đồng xu", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Game", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let betEmbed = new EmbedBuilder()
        .setAuthor({ name: `COINFLIP BUTTONS`})
        .setDescription("Vui lòng chọn mặt đồng xu")
        .setColor("#6F8FAF")
		let h = new ButtonBuilder().setCustomId('heads').setLabel("Ngửa").setStyle(ButtonStyle.Danger);
    let t = new ButtonBuilder().setCustomId('tails').setLabel("Sấp").setStyle(ButtonStyle.Success);	
    const coin = new ActionRowBuilder().addComponents(h, t);
    let sentMsg = await message.reply({ embeds: [betEmbed], components: [coin] });
    var CoinFlip = ["Ngửa", "Sấp"];
    let Fliped = CoinFlip[Math.floor(Math.random() * CoinFlip.length)];
    const collector = message.channel.createMessageComponentCollector({ time: 20000 , max: 1 });
    collector.on('collect', async(i) => {
	      if (i.customId === 'heads') {
          if(Fliped === CoinFlip[0]) { 
            await i.reply({ embeds: [new EmbedBuilder()
              .setImage("https://i.imgur.com/C4lYV1X.png")
              .setTitle("win game")
              .setColor(database.colors.vang)
              .setFooter({ text: `${database.name}`, iconURL: `${database.avatar}` })
              .setDescription(`Bạn đã chọn đúng mặt ${Fliped}`)], components: []
            });
          } else {
            await i.reply({ embeds: [new EmbedBuilder()
                .setImage("https://i.imgur.com/SUpIkmJ.png")
                .setTitle("lose game")
                .setDescription(`Bạn đã chọn sai đồng xu đang ở mặt ${Fliped}`)
                .setColor(database.colors.vang)
                .setFooter({ text: `${database.name}`, iconURL: `${database.avatar}` })], components: []
            });
          }
        } else if(i.customId === 'tails') {
          if(Fliped === CoinFlip[1]) {
            await i.reply({ embeds: [new EmbedBuilder()
              .setImage("https://i.imgur.com/SUpIkmJ.png")
              .setTitle("win game")
              .setColor(database.colors.vang)
              .setFooter({ text: `${database.name}`, iconURL: `${database.avatar}` })
              .setDescription(`${Fliped} thắng. GG`)], components: []
            });
          } else {
            await i.reply({ embeds: [new EmbedBuilder()
              .setImage("https://i.imgur.com/C4lYV1X.png")
              .setTitle("lose game")
              .setDescription(`Bạn đã chọn sai mặt của đồng xu đang là ${Fliped}`)
              .setColor(database.colors.vang)
              .setFooter({ text: `${database.name}`, iconURL: `${database.avatar}` })], components: []
            });
          };
        };
    });
    let disabledRow = new ActionRowBuilder().addComponents(
        h.setDisabled(true).setStyle(ButtonStyle.Success),
        t.setDisabled(true).setStyle(ButtonStyle.Success)
    );
    collector.on('end', (i, reason) => {
       if(reason == "time"){
            sentMsg.edit({ content: "Bạn đã hết thời gian", components: [disabledRow] });
       } else {
          sentMsg.edit({ components: [disabledRow] })          
       }
    });
   },
};