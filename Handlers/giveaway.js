const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { GiveawaysManager } = require("discord-giveaways");
const { Database } = require("st.db");
const giveawayDB = new Database("./Assets/Database/giveawayDatabase.json", { 
  databaseInObject: true 
});

const giveaway = {
  thumbnail: "https://imgur.io/4FGhUuk.gif",
  // image: "",
  messages: {
    title: 'Phần thưởng:\n{this.prize}',
    drawing: 'Kết thúc sau: {timestamp}',
    dropMessage: 'Hãy là người đầu tiên phản ứng với 🎁!',
    inviteToParticipate: 'Phản ứng với 🎁 để tham gia!',
    embedFooter: '{this.winnerCount} người chiến thắng',
    noWinner: 'Giveaway bị hủy, không có người tham gia hợp lệ.',
    hostedBy: 'Tổ chức bởi: {this.hostedBy}',
    winners: 'Người chiến thắng:',
    endedAt: 'Đã kết thúc'
  },
  lastChance: { // Hệ thống cơ hội cuối cùng 
    enabled: true, // nếu hệ thống cơ hội cuối cùng được bật.
    content: '⚠️ **CƠ HỘI CUỐI CÙNG ĐỂ THAM GIA!** ⚠️', // Văn bản embed
    threshold: 10000, // số mili giây trước khi giveaways kết thúc.
    embedColor: 'Random' // màu của embed.
  },
  pauseOptions: {
    isPaused: false, // nếu embed bị tạm dừng.
    content: '⚠️ **GIVEAWAY NÀY ĐÃ TẠM DỪNG!** ⚠️', // văn bản embed
    unpauseAfter: null, // số mili giây hoặc dấu thời gian tính bằng mili giây, sau đó giveaway sẽ tự động bỏ tạm dừng.
    embedColor: 'Random', // màu embed
    infiniteDurationText: '`KHÔNG BAO GIỜ`' // Văn bản được hiển thị bên cạnh GiveawayMessages#drawing phần embed bị tạm dừng, khi không có unpauseAfter.
  }
};

const GiveawaysHandlers = class extends GiveawaysManager {
  constructor(client) {
    super(client, {
      /*========================================================
      * @property {string} [storage='./giveaways.json'] Đường dẫn lưu trữ giveaway.
      * @property {number} [forceUpdateEvery=null] Buộc cập nhật thông báo giveaway trong một khoảng thời gian cụ thể.
      * @property {number} [endedGiveawaysLifetime=null] Số mili giây sau đó giveaway kết thúc sẽ bị xóa khỏi DB. ⚠ giveaway đã xóa khỏi DB không thể được roll lại nữa!
      * @property {Object} [default] Các tùy chọn mặc định cho giveaway mới.
      * @property {boolean} [default.botsCanWin=false] Nếu bot có thể giành được giveaway.
      * @property {Discord.PermissionResolvable[]} [default.exemptPermissions=[]] Thành viên có bất kỳ quyền nào trong số này sẽ không thể giành được giveaway.
      * @property {ExemptMembersFunction} [default.exemptMembers] Chức năng lọc thành viên. Nếu giá trị true được trả về, thành viên đó sẽ không thể giành được giveaway.
      * @property {Discord.ColorResolvable} [default.embedColor='#FF0000'] Màu sắc của giveaway embed khi đang chạy.
      * @property {Discord.ColorResolvable} [default.embedColorEnd='#000000'] Màu của giveaway được embed khi chúng kết thúc.
      * @property {Discord.EmojiIdentifierResolvable} [default.reaction='🎁'] Phản ứng khi muốn tham gia giveaway.
      ========================================================*/
      storage: false, // `${process.cwd()}/Assets/Database/giveawayDatabase.json`, // (Nếu như có hiện tượng bot lag thì mở cái này lên vào giveawayDatabase.json xoá sạch dữ liệu rồi thêm dấu [] vào);
      forceUpdateEvery: null,
      endedGiveawaysLifetime: null,
      default: {
        botsCanWin: false,
        exemptPermissions: [],
        exemptMembers: () => false,
        embedColor: 'Yellow',
        embedColorEnd: 'Red',
        reaction: '<a:hehehe:1091770710915022858>'
      },
    });
  };
  /*========================================================
  # một số events 💾
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
  };
  // Hàm này được gọi khi cần chỉnh sửa giveaway trong cơ sở dữ liệu.
  async editGiveaway(messageId, giveawayData) {
    // Thay thế giveaway chưa chỉnh sửa bằng giveaway đã chỉnh sửa
    giveawayDB.set(messageId, giveawayData);
    // Đừng quên trả lại một cái gì đó!
    return true;
  };
  // Hàm này được gọi khi cần xóa giveaway khỏi cơ sở dữ liệu.
  async deleteGiveaway(messageId) {
    // Xóa giveaway khỏi cơ sở dữ liệu
    giveawayDB.delete(messageId);
    // Đừng quên trả lại một cái gì đó!
    return true;
  };
  /*========================================================
  # Tạo embed được hiển thị khi giveaway đang chạy (với thời gian còn lại)
  # @param {boolean} [lastChanceEnabled=false] Có hay không bao gồm văn bản cơ hội cuối cùng
  ========================================================*/
  generateMainEmbed(giveaways, lastChanceEnabled = false) {
    const embed = new EmbedBuilder()
    embed.setTitle(typeof giveaway.messages.title === 'string' ? giveaway.messages.title : giveaways.prize);
    embed.setColor(giveaways.isDrop ? giveaways.embedColor : giveaway.pauseOptions.isPaused && giveaway.pauseOptions.embedColor ? giveaway.pauseOptions.embedColor : lastChanceEnabled ? giveaway.lastChance.embedColor : giveaways.embedColor);
    embed.setFooter({ text: giveaway.messages.embedFooter.text ?? (typeof giveaway.messages.embedFooter === 'string' ? giveaway.messages.embedFooter : ''), iconURL: giveaway.messages.embedFooter.iconURL });
    embed.setDescription(giveaways.isDrop ? giveaway.messages.dropMessage : (giveaway.pauseOptions.isPaused ? giveaway.pauseOptions.content + '\n\n' : lastChanceEnabled ? giveaway.lastChance.content + '\n\n' : '') + giveaway.messages.inviteToParticipate + '\n' + giveaway.messages.drawing.replace('{timestamp}', giveaways.endAt === Infinity ? giveaway.pauseOptions.infiniteDurationText : `<t:${Math.round(giveaways.endAt / 1000)}:R>`) + (giveaways.hostedBy ? '\n' + giveaway.messages.hostedBy : ''));
    embed.setThumbnail(giveaway.thumbnail);
    embed.setImage(giveaway.image);
    if(giveaways.endAt !== Infinity) {
      embed.setTimestamp(giveaways.endAt);
    };
    return giveaways.fillInEmbed(embed);
  };
  /*========================================================
  # Tạo embed được hiển thị khi giveaway kết thúc (với danh sách người chiến thắng)
  # @param {Discord.GuildMember[]} người húp được giveaway
  ========================================================*/
  generateEndEmbed(giveaways, winners) {
    let formattedWinners = winners.map((w) => `${w}`).join(', ');
    const strings = {
      winners: giveaways.fillInString(giveaway.messages.winners),
      hostedBy: giveaways.fillInString(giveaway.messages.hostedBy),
      endedAt: giveaways.fillInString(giveaway.messages.endedAt),
      title: giveaways.fillInString(giveaway.messages.title) ?? giveaways.fillInString(giveaways.prize)
    };
    const descriptionString = (formattedWinners) => strings.winners + ' ' + formattedWinners + (giveaways.hostedBy ? '\n' + strings.hostedBy : '');
    for (let i = 1; descriptionString(formattedWinners).length > 4096 || strings.title.length + strings.endedAt.length + descriptionString(formattedWinners).length > 6000; i++) {
      formattedWinners = formattedWinners.slice(0, formattedWinners.lastIndexOf(', <@')) + `, ${i} more`;
    };
    return new EmbedBuilder()
      .setTitle(strings.title)
      .setColor(giveaways.embedColorEnd)
      .setFooter({ text: strings.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
      .setDescription(descriptionString(formattedWinners))
      .setTimestamp(giveaways.endAt)
      .setThumbnail(giveaway.thumbnail)
      .setImage(giveaway.image);
    };
    /*========================================================
    # Tạo embed được hiển thị khi giveaway kết thúc và khi không có người tham gia hợp lệ
    ========================================================*/
    generateNoValidParticipantsEndEmbed(giveaways) {
      return giveaways.fillInEmbed(new EmbedBuilder()
      .setTitle(typeof giveaway.messages.title === 'string' ? giveaway.messages.title : giveaways.prize)
      .setColor(giveaways.embedColorEnd)
      .setFooter({ text: giveaway.messages.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
      .setDescription(giveaway.messages.noWinner + (giveaways.hostedBy ? '\n' + giveaway.messages.hostedBy : ''))
      .setTimestamp(giveaways.endAt)
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
            { name: "🎁┆ Phần thưởng", value: `${giveaway.prize}`, inline: true },
            { name: "🥳┆ Giveaway", value: `[Bấm vào đây](https://discordapp.com/channels/${giveaway.message.guildId}/${giveaway.message.channelId}/${giveaway.message.id})`, inline: true }
          )
       ]}).catch((ex) => console.log(ex));
     });
  });
  // gởi tin nhắn đến cho thành viên khi react với icon giveway
  giveawayHandler.on("giveawayReactionAdded", (giveaway, member, reaction) => {
    const ChannelGiveaway = new ButtonBuilder().setLabel("Xem giveaway").setStyle("Link").setURL(`https://discordapp.com/channels/${giveaway.message?.guildId}/${giveaway.message?.channelId}/${giveaway.message?.id}`);
    member.send({ 
      content: `Yêu cầu của bạn vào giveaway này đã được phê duyệt.`,
      components: [new ActionRowBuilder().addComponents([ ChannelGiveaway ])]
    }).catch((ex) => console.log(ex));
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
          { name: "🎁┆ Phần thưởng", value: `${giveaway.prize}`, inline: true },
          { name: "🥳┆ Giveaway", value: `[Bấm vào đây](https://discordapp.com/channels/${giveaway.message.guildId}/${giveaway.message.channelId}/${giveaway.message.id})`, inline: true }
        )
      ]}).catch((ex) => console.log(ex));
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