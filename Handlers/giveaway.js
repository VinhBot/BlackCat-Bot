const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { GiveawaysManager } = require("discord-giveaways");
const { Database } = require("st.db");
const giveawayDB = new Database("./Assets/Database/giveawayDatabase.json", { 
  databaseInObject: true 
});
const GiveawaysHandlers = class extends GiveawaysManager {
  constructor(client) {
    super(client, {
      storage: false, // `${process.cwd()}/Assets/Database/giveawayDatabase.json`, // (Nếu như có hiện tượng bot lag thì mở cái này lên vào giveawayDatabase.json xoá sạch dữ liệu rồi thêm dấu [] vào);
      forceUpdateEvery: null,
      endedGiveawaysLifetime: null,
      default: {
        botsCanWin: false, // 
        exemptPermissions: [],
        exemptMembers: () => false,
        embedColor: '#FF0000',
        embedColorEnd: '#000000',
        reaction: '<a:hehehe:1091770710915022858>',
        lastChance: {
            enabled: false,
            content: '⚠️ **CƠ HỘI CUỐI CÙNG ĐỂ THAM GIA !** ⚠️',
            threshold: 5000,
            embedColor: '#FF0000'
        }
      }
    });
  };
  /*========================================================
  # Database 💾
  ========================================================*/
  // Hàm này được gọi khi người quản lý cần lấy tất cả giveaway được lưu trữ trong cơ sở dữ liệu.
  async getAllGiveaways() {
    // Lấy tất cả giveaway từ cơ sở dữ liệu
    return giveawayDB.valuesAll();
  };
  // Hàm này được gọi khi một giveaway cần được lưu trong cơ sở dữ liệu.
  async saveGiveaway(messageId, giveawayData) {
    // Thêm giveaway mới vào cơ sở dữ liệu
    giveawayDB.set(messageId, giveawayData);
    // Đừng quên trả lại một cái gì đó!
    return true;
  }
  // Hàm này được gọi khi cần chỉnh sửa giveaway trong cơ sở dữ liệu.
  async editGiveaway(messageId, giveawayData) {
    // Thay thế giveaway chưa chỉnh sửa bằng giveaway đã chỉnh sửa
    giveawayDB.set(messageId, giveawayData);
    // Đừng quên trả lại một cái gì đó!
    return true;
  }
  // Hàm này được gọi khi cần xóa giveaway khỏi cơ sở dữ liệu.
  async deleteGiveaway(messageId) {
    // Xóa giveaway khỏi cơ sở dữ liệu
    giveawayDB.delete(messageId);
    // Đừng quên trả lại một cái gì đó!
    return true;
  }
  /*========================================================
  # Tạo embed được hiển thị khi giveaway đang chạy (với thời gian còn lại)
  # @param {boolean} [lastChanceEnabled=false] Có hay không bao gồm văn bản cơ hội cuối cùng
  ========================================================*/
  generateMainEmbed(giveaway, lastChanceEnabled = false) {
    const embed = new EmbedBuilder()
    embed.setTitle(typeof giveaway.messages.title === 'string' ? giveaway.messages.title : giveaway.prize);
    embed.setColor(giveaway.isDrop ? giveaway.embedColor : giveaway.pauseOptions.isPaused && giveaway.pauseOptions.embedColor ? giveaway.pauseOptions.embedColor : lastChanceEnabled ? giveaway.lastChance.embedColor : giveaway.embedColor );
    embed.setFooter({ text: giveaway.messages.embedFooter.text ?? (typeof giveaway.messages.embedFooter === 'string' ? giveaway.messages.embedFooter : ''), iconURL: giveaway.messages.embedFooter.iconURL });
    embed.setDescription(giveaway.isDrop ? giveaway.messages.dropMessage : (giveaway.pauseOptions.isPaused ? giveaway.pauseOptions.content + '\n\n' : lastChanceEnabled ? giveaway.lastChance.content + '\n\n' : '') + giveaway.messages.inviteToParticipate + '\n' + giveaway.messages.drawing.replace('{timestamp}', giveaway.endAt === Infinity ? giveaway.pauseOptions.infiniteDurationText : `<t:${Math.round(giveaway.endAt / 1000)}:R>`) + (giveaway.hostedBy ? '\n' + giveaway.messages.hostedBy : ''));
    embed.setThumbnail(giveaway.thumbnail);
    embed.setImage(giveaway.image);
    if(giveaway.endAt !== Infinity) {
      embed.setTimestamp(giveaway.endAt);
    };
    return giveaway.fillInEmbed(embed);
  };
  /*========================================================
  # Tạo embed được hiển thị khi giveaway kết thúc (với danh sách người chiến thắng)
  # @param {Discord.GuildMember[]} người húp được giveaway
  ========================================================*/
  generateEndEmbed(giveaway, winners) {
    let formattedWinners = winners.map((w) => `${w}`).join(', ');
    const strings = {
      winners: giveaway.fillInString(giveaway.messages.winners),
      hostedBy: giveaway.fillInString(giveaway.messages.hostedBy),
      endedAt: giveaway.fillInString(giveaway.messages.endedAt),
      title: giveaway.fillInString(giveaway.messages.title) ?? giveaway.fillInString(giveaway.prize)
    };
    const descriptionString = (formattedWinners) => strings.winners + ' ' + formattedWinners + (giveaway.hostedBy ? '\n' + strings.hostedBy : '');
    for (let i = 1; descriptionString(formattedWinners).length > 4096 || strings.title.length + strings.endedAt.length + descriptionString(formattedWinners).length > 6000; i++) {
      formattedWinners = formattedWinners.slice(0, formattedWinners.lastIndexOf(', <@')) + `, ${i} more`;
    };
    return new EmbedBuilder()
      .setTitle(strings.title)
      .setColor(giveaway.embedColorEnd)
      .setFooter({ text: strings.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
      .setDescription(descriptionString(formattedWinners))
      .setTimestamp(giveaway.endAt)
      .setThumbnail(giveaway.thumbnail)
      .setImage(giveaway.image);
    };
    /*========================================================
    # Tạo embed được hiển thị khi giveaway kết thúc và khi không có người tham gia hợp lệ
    ========================================================*/
    generateNoValidParticipantsEndEmbed(giveaway) {
      return giveaway.fillInEmbed(new EmbedBuilder()
      .setTitle(typeof giveaway.messages.title === 'string' ? giveaway.messages.title : giveaway.prize)
      .setColor(giveaway.embedColorEnd)
      .setFooter({ text: giveaway.messages.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
      .setDescription(giveaway.messages.noWinner + (giveaway.hostedBy ? '\n' + giveaway.messages.hostedBy : ''))
      .setTimestamp(giveaway.endAt)
      .setThumbnail(giveaway.thumbnail)
      .setImage(giveaway.image));
    };
};
  
module.exports = (client) => {
  const giveawayHandler = new GiveawaysHandlers(client);
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