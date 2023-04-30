const {
  ButtonBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonStyle,
  ChannelType,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  PermissionsBitField,
  TextInputStyle
} = require('discord.js');

const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let time = 120000;
    const emb = new EmbedBuilder()
    .setTitle("Thiết lập tùy chỉnh")
    .setColor("Random")
    .setDescription(`Đây là cài đặt __${client.user.username}__ từ **${message.guild.name}** và bạn có thể thiết lập mọi thứ cần thiết để thành lập guild của mình.`)
    .addFields([
      { name: `Bot Language:`, value: `zzzz`, inline: false }, 
    ])
    .setFooter({ text: `Cài đặt • Được yêu cầu bởi ${message.member.username} `, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setTimestamp()
    const menu = new StringSelectMenuBuilder().setCustomId("setup_menu").setMaxValues(1).setMinValues(1).setPlaceholder(`Nhấp vào tôi để thiết lập !!`).addOptions([
          { 
            label: `Setup Bot Language`,
            value: `stlanguage`,
            emoji: `🧪`
          }, { 
            label: `Setup Ticket Type`, 
            value: `sttype`,
            emoji: `🎶`
          }, { 
            label: `Setup Ticket Menu Option`,
            value: `stoption`,
            emoji: `📚` 
          }
    ]);
    const button1 = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Home Page').setDisabled(true).setEmoji("🛖").setCustomId("homePage");
    const button2 = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Report').setEmoji("🛠️").setCustomId(`report`);
    const button3 = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Support').setEmoji("💬").setURL(`https://discord.gg/tSTY36dPWa`);
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();
    return message.reply({ 
      embeds: [emb],
      components: [
        row1.addComponents(menu),
        row2.addComponents(button1, button2, button3)
      ]
    }).then(async(msg) => {
      await msg.createMessageComponentCollector({ time: time }).on('collect', async(m) => {
        if(m.user.id === message.member.id) {
          if(m.isButton()) {
            if(m.customId === "homePage") return m.update({
              embeds: [emb],
              components: [
                row1.addComponents(menu),
                row2.addComponents(button1, button2, button3)
              ]
            });
          };
          if(m.isStringSelectMenu()) {
            if(m.customId === "setup_menu") {
              if(m.values[0] === "stlanguage") return m.update({
                embeds: [emb.setDescription("language")],
                components: [
                  row1.addComponents(menu),
                  row2.addComponents(button1.setDisabled(false), button2, button3)
                ]
              });
            };
          };
        };
      });
    });
  },
};