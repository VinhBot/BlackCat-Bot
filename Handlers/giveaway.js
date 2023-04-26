const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelType, ButtonStyle, TextInputStyle, ComponentType } = require("discord.js");
const { GiveawaysManager } = require("discord-giveaways");
const { Database } = require("st.db");
const ms = require("enhanced-ms");
const giveawayDB = new Database("./Assets/Database/giveaways.json", { 
  databaseInObject: true 
});

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
    /**
    * tùy chọn tin nhắn mặc định khi chạy giveaway
    */
    this.optionalDefault =  {
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
    return true;
  };
  // Hàm này được gọi khi cần chỉnh sửa giveaway trong cơ sở dữ liệu.
  async editGiveaway(messageId, giveawayData) {
    // Thay thế giveaway chưa chỉnh sửa bằng giveaway đã chỉnh sửa
    giveawayDB.set(messageId, giveawayData);
    return true;
  };
  // Hàm này được gọi khi cần xóa giveaway khỏi cơ sở dữ liệu.
  async deleteGiveaway(messageId) {
    // Xóa giveaway khỏi cơ sở dữ liệu
    giveawayDB.delete(messageId);
    return true;
  };
  /*========================================================
  # Tạo embed được hiển thị khi giveaway đang chạy (với thời gian còn lại)
  # @param {boolean} [lastChanceEnabled=false] Có hay không bao gồm văn bản cơ hội cuối cùng
  ========================================================*/
  generateMainEmbed(giveaways, lastChanceEnabled = false) {
    const giveaway = this.optionalDefault;
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
    const giveaway = this.optionalDefault;
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
    const giveaway = this.optionalDefault;
    return giveaways.fillInEmbed(new EmbedBuilder()
    .setTitle(typeof giveaway.messages.title === 'string' ? giveaway.messages.title : giveaways.prize)
    .setColor(giveaways.embedColorEnd)
    .setFooter({ text: giveaway.messages.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
    .setDescription(giveaway.messages.noWinner + (giveaways.hostedBy ? '\n' + giveaway.messages.hostedBy : ''))
    .setTimestamp(giveaways.endAt)
    .setThumbnail(giveaway.thumbnail)
    .setImage(giveaway.image));
  };
  /*========================================================
  # runModalSetup /
  ========================================================*/
  async runModalSetup(message, targetCh) {
    const { member, channel, guild } = message;
    if(!targetCh) return channel.send("Thiết lập giveaway đã bị hủy. Bạn đã không đề cập đến một kênh");
    if(!targetCh.type === ChannelType.GuildText && !targetCh.permissionsFor(guild.members.me).has(["ViewChannel", "SendMessages", "EmbedLinks"])) return channel.send({
      content: `Thiết lập giveaway đã bị hủy.\ntôi cần quyền admin trong ${targetCh}`
    });
    const sentMsg = await channel.send({
       content: "Vui lòng nhấp vào nút bên dưới để thiết lập giveaway mới",
       components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("giveaway_btnSetup").setLabel("thiết lập Giveaway").setStyle(ButtonStyle.Primary))],
    });
    if(!sentMsg) return;
    const btnInteraction = await channel.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    }).catch((ex) => console.log(ex));
    if(!btnInteraction) return sentMsg.edit({ 
      content: "Không nhận được phản hồi, đang hủy thiết lập",
      components: [] 
    });
    // các tùy chọn modal
    await btnInteraction.showModal(new ModalBuilder({
      customId: "giveaway-modalSetup",
      title: "Thiết lập Giveaway",
      components: [
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("duration").setLabel("thời lượng là bao lâu?").setPlaceholder("1m/1h/1d/1w").setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("prize").setLabel("Giải thưởng là gì?").setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("winners").setLabel("Số người chiến thắng?").setStyle(TextInputStyle.Short).setRequired(true)),
      ],
    }));
    // 
    const modal = await btnInteraction.awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "giveaway-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    }).catch((ex) => console.log(ex));
    // nếu như không nhận được phản hồi hợp lệ, hủy thiết lập :))
    if(!modal) return sentMsg.edit({ content: "Không nhận được phản hồi, đang hủy thiết lập", components: [] });
    // xoá sentMsg trước đó nếu đã được thiết lập
    sentMsg.delete().catch(() => {});
    // thoing báo thiết lập
    await modal.reply("Thiết lập giveaway...");
    // thời gian 
    const duration = ms(modal.fields.getTextInputValue("duration"));
    if(isNaN(duration)) return modal.editReply("Thiết lập đã bị hủy bỏ. Bạn đã không chỉ định thời hạn hợp lệ");
    // phần thưởng
    const prize = modal.fields.getTextInputValue("prize");
    // số người chiến thắng
    const winners = parseInt(modal.fields.getTextInputValue("winners"));
    if(isNaN(winners)) return modal.editReply("Thiết lập đã bị hủy. Bạn không chỉ định số lượng người chiến thắng hợp lệ");
    //
    try {
      const options = {
        duration: duration,
        prize,
        winnerCount: winners,
        hostedBy: `<@${message.author ? message.author.id : message.user.id}>`,
        messages: {
          giveaway: '🎉🎉 **Bắt đầu Giveaways** 🎉🎉',
          giveawayEnded: '🎉🎉 **Giveaways đã kết thúc** 🎉🎉',
          winMessage: 'Chúc mừng, {winners}! Bạn đã thắng **{this.prize}**!\nVui lòng liên hệ với chủ sever để nhận giải',
        }
      };
      await this.start(targetCh, options);
    } catch(error) {
      console.log(error);
      return message.reply({ content: `Đã xảy ra lỗi khi bắt đầu giveaway: ${error}` });
    };
    await modal.editReply(`Giveaways đã được bắt đầu trong ${targetCh}`);
  };
  // chỉnh sửa giveaway
  async runModalEdit(message, messageId) {
    const { member, channel } = message;
    if(!messageId) return message.reply({ content: "Bạn phải cung cấp id tin nhắn hợp lệ." });
    const giveaway = this.giveaways.find((g) => g.messageId === messageId && g.guildId === member.guild.id);
    if(!giveaway) return message.reply({ content: `Không thể tìm thấy giveaway cho messageId: ${messageId}` });
    const sentMsg = await channel.send({
      content: "Vui lòng nhấp vào nút bên dưới để chỉnh sửa giveaway",
      components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("giveaway_btnEdit").setLabel("Chỉnh sửa Giveaway").setStyle(ButtonStyle.Primary))],
    });
    const btnInteraction = await channel.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnEdit" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    }).catch((ex) => {});
    if(!btnInteraction) return sentMsg.edit({ content: "Không nhận được phản hồi, hủy cập nhật", components: [] });
    // phương thức hiển thị
    await btnInteraction.showModal(new ModalBuilder({
      customId: "giveaway-modalEdit",
      title: "Cập nhật Giveaway",
      components: [
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("duration").setLabel("Thời gian để thêm").setPlaceholder("1h / 1d / 1w").setStyle(TextInputStyle.Short).setRequired(false)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("prize").setLabel("giải thưởng mới là gì?").setStyle(TextInputStyle.Short).setRequired(false)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("winners").setLabel("Number of winners?").setStyle(TextInputStyle.Short).setRequired(false)),
      ],
    }));
    // nhận đầu vào phương thức
    const modal = await btnInteraction.awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "giveaway-modalEdit" && m.member.id === member.id && m.message.id === sentMsg.id,
    }).catch((ex) => {});
    if(!modal) return sentMsg.edit({ content: "Không nhận được phản hồi, hủy cập nhật", components: [] });
    sentMsg.delete().catch(() => {});
    await modal.reply("Cập nhật giveaway...");
    // thời gian
    const addDuration = ms(modal.fields.getTextInputValue("duration"));
    if(isNaN(addDuration)) return modal.editReply("Cập nhật đã bị hủy bỏ. Bạn đã không chỉ định thời lượng thêm hợp lệ");
    // phần thưởng
    const newPrize = modal.fields.getTextInputValue("prize");
    // số người chiến thắng
    const newWinnerCount = parseInt(modal.fields.getTextInputValue("winners"));
    if(isNaN(newWinnerCount)) return modal.editReply("Cập nhật đã bị hủy bỏ. Bạn đã không chỉ định số lượng người chiến thắng hợp lệ");
    // edit
    try {
      await this.edit(messageId, {
        addTime: addDuration || 0,
        newPrize: newPrize || giveaway.prize,
        newWinnerCount: newWinnerCount || giveaway.winnerCount,
      });
    } catch(error) {
      return message.reply({ content: `Đã xảy ra lỗi khi cập nhật giveaway: ${error.message}` });
    };
    await modal.editReply("Đã cập nhật thành công giveaway!");
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
  // client giveaways
  client.giveawaysManager = giveawayHandler;
};