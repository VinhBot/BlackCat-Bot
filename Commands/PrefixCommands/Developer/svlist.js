const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require("discord.js");
async function EmbedPages(message, embeds, style = {}) {
    style.but1 ||= "⬅️"; // Đầu tiên
    style.but2 ||= "↩️"; // Trước
    style.but3 ||= "❌"; // Xóa bỏ 
    style.but4 ||= "↪️"; // Tiếp theo
    style.but5 ||= "➡️"; // Cuối Cùng
    style.butColor ||= ButtonStyle.Primary; // màu nút chuyển động
    style.butColor2 ||= ButtonStyle.Danger; // màu nút xoá bỏ
    let but1 = new ButtonBuilder().setStyle(style.butColor).setCustomId("Đầu_tiên").setEmoji(style.but1).setDisabled(false);
    let but2 = new ButtonBuilder().setStyle(style.butColor).setCustomId("Trước").setEmoji(style.but2).setDisabled(false);
    let but3 = new ButtonBuilder().setStyle(style.butColor2).setCustomId("xóa_bỏ").setEmoji(style.but3).setDisabled(false);
    let but4 = new ButtonBuilder().setStyle(style.butColor).setCustomId("tiếp_theo").setEmoji(style.but4).setDisabled(false);
    let but5 = new ButtonBuilder().setStyle(style.butColor).setCustomId("Cuối_cùng").setEmoji(style.but5).setDisabled(false);
    const row = new ActionRowBuilder().addComponents(but1.setDisabled(false), but2.setDisabled(false), but3.setDisabled(false), but4.setDisabled(false), but5.setDisabled(false));
    if (embeds.length == 1) {
        return message.channel.send({ embeds: [embeds[0]], components: [new ActionRowBuilder().addComponents([but1.setDisabled(true), but2.setDisabled(true), but3.setDisabled(true), but4.setDisabled(true), but5.setDisabled(true)])] });
    };
    embeds = embeds.map((embed, index) => {
        return embed.setFooter({ text: `Page: ${index + 1}/${embeds.length}`, iconURL: message.guild.iconURL() });
    });
    let curPage = 0;
    const sendMsg = await message.channel.send({ embeds: [embeds[0]], components: [new ActionRowBuilder().addComponents(but1.setDisabled(true), but2.setDisabled(true), but3.setDisabled(false), but4.setDisabled(false), but5.setDisabled(false))] });
    const collector = sendMsg.createMessageComponentCollector({ 
      filter: (m) => m.member.id === message.member.id, 
      time: 120000, 
      componentType: ComponentType.Button
    });
    collector.on("collect", async (b) => {
        await b.deferUpdate().catch((e) => null);
        if (b.customId === 'tiếp_theo') {
            curPage++;
            if (curPage !== embeds.length - 1) {
                await sendMsg.edit({ embeds: [embeds[curPage]], components: [new ActionRowBuilder().addComponents( but1.setDisabled(false), but2.setDisabled(false), but3.setDisabled(false), but4.setDisabled(false), but5.setDisabled(false))] });
            } else {
                await sendMsg.edit({ embeds: [embeds[curPage]], components: [ new ActionRowBuilder().addComponents(but1.setDisabled(false), but2.setDisabled(false), but3.setDisabled(false), but4.setDisabled(true), but5.setDisabled(true))] });
            };
        };
        if (b.customId === 'Trước') {
            curPage--;
            if (curPage !== 0) {
                return sendMsg.edit({ embeds: [embeds[curPage]], components: [new ActionRowBuilder().addComponents( but1.setDisabled(false), but2.setDisabled(false), but3.setDisabled(false), but4.setDisabled(false), but5.setDisabled(false))] });
            } else {
                sendMsg.edit({ embeds: [embeds[curPage]], components: [new ActionRowBuilder().addComponents( but1.setDisabled(true), but2.setDisabled(true), but3.setDisabled(false), but4.setDisabled(false), but5.setDisabled(false))] });
            };
        };
        if (b.customId === 'Đầu_tiên') {
            curPage = 0;
            await sendMsg.edit({ embeds: [embeds[curPage]], components: [new ActionRowBuilder().addComponents( but1.setDisabled(true), but2.setDisabled(true), but3.setDisabled(false), but4.setDisabled(false), but5.setDisabled(false))] });
        };
        if (b.customId === 'Cuối_cùng') {
            curPage = embeds.length - 1;
            await sendMsg.edit({ embeds: [embeds[curPage]], components: [new ActionRowBuilder().addComponents(but1.setDisabled(false), but2.setDisabled(false), but3.setDisabled(false), but4.setDisabled(true), but5.setDisabled(true) )] });
        };
        if (b.customId === 'xóa_bỏ') {
          row.components.forEach((btn) => btn.setDisabled(true));
            await sendMsg.edit({ embeds: [embeds[curPage]], components: [row] });
        };
        collector.on("end", async() => {
            row.components.forEach((btn) => btn.setDisabled(true));
            if (sendMsg.editable) {
                await sendMsg.edit({ embeds: [embeds[curPage]], components: [row] });
            };
        });
    });
};
const database = require(`${process.cwd()}/config.json`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: [""], // lệnh phụ
  description: "Xem danh sách sever mà bot hỗ trợ", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"Developer", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    try {
        let embed1 = new EmbedBuilder()
        .setAuthor({ name: client.user.tag , iconURL: client.user.displayAvatarURL() })
        .setColor(database.colors.vang)
        .setTimestamp()
        await client.guilds.cache.map(guilds_now => guilds_now).slice(0 , 8).map((guilds_now , i) => {
            embed1.addFields({ name: `#${i+1} name: ${guilds_now.name}`, value:`ID: \`${guilds_now.id}\`, member: \`${guilds_now.memberCount}\``, inline: true })
            return 0;
        });
        let embed2 = new EmbedBuilder()
        .setAuthor({ name: client.user.tag , iconURL: client.user.displayAvatarURL()})
        .setColor(database.colors.vang)
        .setTimestamp()
        await client.guilds.cache.map(guilds_now => guilds_now).slice(9 , 16).map((guilds_now , i) => {
            embed2.addFields({ name: `#${i+1} name: ${guilds_now.name}`, value:`ID: \`${guilds_now.id}\`, member: \`${guilds_now.memberCount}\``, inline: true })
            return 0;
        });
        let embeds = [];
        embeds.push(embed1, embed2);
        EmbedPages(message, embeds, {
          // but1: tương ứng với các emoji tùy chỉnh, để trống để dùng emoji mặc định
          but1: "⬅️", // Đầu tiên
          but2: "↩️", // Trước
          but3: "❌", // Xoá bỏ
          but4: "➡️", // Tiếp theo
          but5: "↪️", // cuối cùng
          butColor: "", // màu của các nút chuyển động
          butColor: "" // màu của nút xoá
        });
    } catch(e) {
      return message.reply({ embeds: [new EmbedBuilder().setDescription(`${e}`)]});
    };
  },
};