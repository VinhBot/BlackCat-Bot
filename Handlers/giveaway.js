const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { GiveawaysManager } = require("discord-giveaways");

module.exports = (client) => {
  const giveawayHandler = new GiveawaysManager(client, {
    storage: `${process.cwd()}/Assets/Database/giveawayDatabase.json`,
    default: {
        botsCanWin: false,
        embedColor: "#FF0000",
        reaction: "<a:hehehe:1091770710915022858>",
        lastChance: {
            enabled: true,
            content: '⚠️ ** CƠ HỘI CUỐI CÙNG ĐỂ THAM GIA !** ⚠️',
            threshold: 10000,
            embedColor: '#FF0000'
        }
    }
  });
  // gởi tin nhắn đến cho người chiến thắng 
  giveawayHandler.on("giveawayRerolled", (giveaway, winners) => {
     winners.forEach((member) => {
       member.send({ embeds: [new EmbedBuilder() 
          .setTile("🎉・Giveaway đã kết thúc")
          .setDescription(`Xin chúc mừng ${member.user.username}! Bạn đã trở thành người chiến thắng!`)
          .addFields(
            { name: "🎁┆Phần thưởng", value: `${giveaway.prize}`, inline: true },
            { name: "🥳┆Giveaway", value: `[Bấm vào đây](https://discordapp.com/channels/${giveaway.message.guildId}/${giveaway.message.channelId}/${giveaway.message.id})`, inline: true }
          )
       ]}).catch((ex) => {});
     });
  });
  // gởi tin nhắn đến cho thành viên khi react với icon giveway
  giveawayHandler.on("giveawayReactionAdded", (giveaway, member, reaction) => {
    const ChannelGiveaway = new ButtonBuilder().setLabel("Xem giveaway").setStyle("Link").setURL(`https://discordapp.com/channels/${giveaway.message?.guildId}/${giveaway.message?.channelId}/${giveaway.message?.id}`);
    member.send({ 
      content: `Yêu cầu của bạn vào giveaway này đã được phê duyệt.`,
      components: [new ActionRowBuilder().addComponents([ ChannelGiveaway ])]
    }).catch((ex) => {});
  }); 
  // gởi tin nhắn cho thành viên khi họ out khỏi giveaway 
  giveawayHandler.on('giveawayReactionRemoved', (giveaway, member, reaction) => {
    const ChannelGiveaway = new ButtonBuilder().setLabel("Xem giveaway").setStyle("Link").setURL(`https://discordapp.com/channels/${giveaway.message?.guildId}/${giveaway.message?.channelId}/${giveaway.message?.id}`);
    return member.send({
      content: "Bạn đã hủy lượt tham gia dành giải thưởng",
      components: [new ActionRowBuilder().addComponents([ ChannelGiveaway ])]
    });
  });
  // gởi tin nhắn đến cho người chiến thắng 
  giveawayHandler.on("giveawayEnded", (giveaway, winners) => {
    winners.forEach((member) => {
      member.send({ embeds: [new EmbedBuilder() 
        .setTile("🎉・Giveaway đã kết thúc")
        .setDescription(`Xin chúc mừng ${member.user.username}! Bạn đã trở thành người chiến thắng!`)
        .addFields(
          { name: "🎁┆Phần thưởng", value: `${giveaway.prize}`, inline: true },
          { name: "🥳┆Giveaway", value: `[Bấm vào đây](https://discordapp.com/channels/${giveaway.message.guildId}/${giveaway.message.channelId}/${giveaway.message.id})`, inline: true }
        )
      ]}).catch((ex) => {});
    });
  });
  // gởi tin nhắm cho thành viên khi giveaway đã kết thúc mà thành viên vẫn react với emojis
  giveawayHandler.on("endedGiveawayReactionAdded", (giveaway, member, reaction) => {
    member.send({ content: "Thật không may, giveaway đã kết thúc! Bạn không thể tham gia nữa" }).catch((ex) => {});
  });
  // Xuất hiện khi giveaway đã bị xoá
  giveawayHandler.on('giveawayDeleted', (giveaway) => {
    console.log(`Giveaway với id ${giveaway.messageId} đã bị xoá`)
  });
  // evnets giveaways
  client.giveawaysManager = giveawayHandler;
};