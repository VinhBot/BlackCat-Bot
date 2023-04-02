const { EmbedBuilder, parseEmoji, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType, Collection, SelectMenuBuilder } = require("discord.js");
const { Database } = require("st.db");
const ems = require("enhanced-ms");
const fetch = require("node-fetch");
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});
/*========================================================
========================================================*/
const setupDatabase = async(guild) => {
  const checkData = await database.has(guild.id);
  if(!checkData) {          // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
    console.log(`Đã tạo database cho: ${guild.name}`); // thông báo ra bảng điều khiển
    await database.set(guild.id, {             // nếu chưa có thì nhập guilds vào cơ sở dữ liệu
      defaultGuildName: guild.name,            // tên guilds
      setDefaultPrefix: config.prefix,         // đặt prefix mặc định cho guild
      setDefaultMusicData: {                   // thiết lập mặc định dành cho hệ thống âm nhạc
        DefaultAutoresume: true,               // 1: chế độ mặc định tự đông phát lại nhạc bot gặp sự cố
        DefaultAutoplay: false,                // 2: chế độ tự động phát nhạc khi kết thúc bài hát
        DefaultVolume: 50,                     // 3: cài đặt âm lượng mặc định cho guild
        DefaultFilters: ['bassboost', '3d'],   // 4: cài đặt filters mặc định cho guils
        MessageId: "",                         // 5: thiết lập id tin nhắn 
        ChannelId: "",                         // 6: thiết lập channelid
        Djroles: [],                           // 7: thiết lập role chuyên nhạc                  
      },
      setDefaultWelcomeGoodbyeData: {          // thiết lập welcome, googbye, 
        WelcomeChannel: "",
        GoodbyeChannel: "",
        AutoAddRoleWel: [], 
      },
    });
  };
};

//
function onCoolDown(cooldowns, message, commands) {
  if (!message || !commands) return;
  let { member } = message;
  if(!cooldowns.has(commands.name)) {
    cooldowns.set(commands.name, new Collection());
  };
  const now = Date.now();
  const timestamps = cooldowns.get(commands.name);
  const cooldownAmount = commands.cooldown * 1000;
  if(timestamps.has(member.id)) {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;
    if(now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000; //có được thời gian còn lại
      return timeLeft;
    } else {
      timestamps.set(member.id, now);
      setTimeout(() => timestamps.delete(member.id), cooldownAmount);
      return false;
    };
  } else {
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
    return false;
  };
};

const disspace = function(newQueue, newTrack, queue) {
    let skip = new ButtonBuilder().setStyle('Primary').setCustomId('skip').setEmoji(`⏭`).setLabel(`Bỏ qua`);
    let stop = new ButtonBuilder().setStyle('Danger').setCustomId('stop').setEmoji(`😢`).setLabel(`Dừng phát`);
    let pause = new ButtonBuilder().setStyle('Success').setCustomId('pause').setEmoji('⏸').setLabel(`Tạm dừng`);
    let autoplay = new ButtonBuilder().setStyle('Success').setCustomId('autoplay').setEmoji('🧭').setLabel(`Tự động phát`);
    let shuffle = new ButtonBuilder().setStyle('Primary').setCustomId('shuffle').setEmoji('🔀').setLabel(`Xáo trộn`);
    let songloop = new ButtonBuilder().setStyle('Success').setCustomId('song').setEmoji(`🔁`).setLabel(`Bài hát`);
    let queueloop = new ButtonBuilder().setStyle('Success').setCustomId('queue').setEmoji(`🔂`).setLabel(`Hàng chờ`);
    let forward = new ButtonBuilder().setStyle('Primary').setCustomId('seek').setEmoji('⏩').setLabel(`+10 Giây`);
    let rewind = new ButtonBuilder().setStyle('Primary').setCustomId('seek2').setEmoji('⏪').setLabel(`-10 Giây`);
    let lyrics = new ButtonBuilder().setStyle('Primary').setCustomId('lyrics').setEmoji('📝').setLabel(`Lời nhạc`);
    let volumeUp = new ButtonBuilder().setStyle('Primary').setCustomId('volumeUp').setEmoji('🔊').setLabel(`+10`);
    let volumeDown = new ButtonBuilder().setStyle('Primary').setCustomId('volumeDown').setEmoji('🔉').setLabel(`-10`);
    let discord = new ButtonBuilder().setStyle("Link").setEmoji('🏤').setLabel(`Vào discord`).setURL(`${config.discord}`);
    let invitebot = new ButtonBuilder().setStyle("Link").setEmoji('🗿').setLabel(`Mời Bot`).setURL(`${config.discordBot}`);
    if(!newQueue) return new EmbedBuilder().setColor("Random").setTitle(`Không thể tìm kiếm bài hát`);
    if(!newTrack) return new EmbedBuilder().setColor("Random").setTitle(`Không thể tìm kiếm bài hát`);
    if(!newQueue.playing) {
      pause = pause.setStyle('Success').setEmoji('▶️').setLabel(`Tiếp tục`)
    } else if(newQueue.autoplay) {
      autoplay = autoplay.setStyle('Secondary')
    } else if(newQueue.repeatMode === 0) {
      songloop = songloop.setStyle('Success')
      queueloop = queueloop.setStyle('Success')
    } else if(newQueue.repeatMode === 1) {
      songloop = songloop.setStyle('Secondary')
      queueloop = queueloop.setStyle('Success')
    } else if(newQueue.repeatMode === 2) {
      songloop = songloop.setStyle('Success')
      queueloop = queueloop.setStyle('Secondary')
    };
    if(Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled()
    } else {
      rewind = rewind.setDisabled(false)
    };
    if(Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
      forward = forward.setDisabled()
    } else {
      forward = forward.setDisabled(false)
    };
    return { 
      embeds: [new EmbedBuilder()
        .setAuthor({ name: `${newTrack.name}`, iconURL: "https://i.pinimg.com/originals/ab/4d/e0/ab4de08ece783245be1fb1f7fde94c6f.gif", url: newTrack.url })
        .setImage(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`).setColor("Random")
        .addFields([
          { name: `Thời lượng:`, value: `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\`` },
          { name: `Hàng chờ:`, value: `>>> \`${newQueue.songs.length} bài hát\`\n\`${newQueue.formattedDuration}\`` },
          { name: `Âm lượng:`, value: `>>> \`${newQueue.volume} %\`` },
          { name: `vòng lặp:`, value: `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `✔️ hàng chờ` : `✔️ Bài hát` : `❌`}` },
          { name: `Tự động phát:`, value: `>>> ${newQueue.autoplay ? `✔️` : `❌`}` },
          { name: `Filters:`, value: `\`${newQueue.filters.names.join(", ") || "Tắt"}\`` },
          { name: `Tải nhạc về:`, value: `>>> [Click vào đây](${newTrack.streamURL})` },
          { name: `Lượt xem:`, value: `${Intl.NumberFormat().format(newQueue.songs[0].views)}` },
          { name: `Likes`, value: `👍 ${Intl.NumberFormat().format(newQueue.songs[0].likes)}` },
          { name: `Dislikes`, value: `👎 ${Intl.NumberFormat().format(newQueue.songs[0].dislikes)}` },
        ])
      ], 
      components: [
        new ActionRowBuilder().addComponents([ skip, lyrics, pause, autoplay, shuffle ]),
        new ActionRowBuilder().addComponents([ songloop, queueloop, rewind, forward, volumeDown ]),
        new ActionRowBuilder().addComponents([ volumeUp, stop, discord, invitebot ]),
      ] 
  };
};
/*========================================================
# baseURL
========================================================*/
const baseURL = async(url, options) => {
  const response = options ? await fetch(url, options) : await fetch(url);
  const json = await response.json();
  return {
    success: response.status === 200 ? true : false,
    status: response.status,
    data: json,
  };
};
/*========================================================
# Giveaways
========================================================*/
const GiveawayClass = class {
  constructor(defaultClient) {
    this.client = defaultClient;
  };
  async start(member, giveawayChannel, duration, prize, winners, host, allowedRoles = []) {
    try {
      if (!host) host = member.user;
      if (!member.permissions.has("ManageMessages")) return "Bạn cần có quyền ManageMessages để bắt đầu giveaway.";
      if(!giveawayChannel.type === ChannelType.GuildText) return "Bạn chỉ có thể bắt đầu giveaway trong các kênh văn bản.";
      const options = {
        duration: duration,
        prize,
        winnerCount: winners,
        hostedBy: host,
        thumbnail: "https://i.imgur.com/DJuTuxs.png",
        messages: {
          giveaway: '🎉🎉 **GIVEAWAY** 🎉🎉',
          giveawayEnded: '🎉🎉 **GIVEAWAY ENDED** 🎉🎉',
          title: '{this.prize}',
          drawing: 'Kết thúc sau: {timestamp}',
          dropMessage: 'Hãy là người đầu tiên phản ứng với 🎁!',
          inviteToParticipate: 'Phản ứng với 🎁 để tham gia!',
          winMessage: 'Chúc mừng, {winners}! Bạn đã thắng **{this.prize}**!\nVui lòng liên hệ với chủ sever để nhận giải',
          embedFooter: '{this.winnerCount} người chiến thắng',
          noWinner: 'Giveaway bị hủy, không có người tham gia hợp lệ.',
          hostedBy: 'Tổ chức bởi: {this.hostedBy}',
          winners: 'Người chiến thắng:',
          endedAt: 'Đã kết thúc'
        },
      };
      if (allowedRoles.length > 0) {
        options.exemptMembers = (member) => !member.roles.cache.find((role) => allowedRoles.includes(role.id));
      };
      await this.client.giveawaysManager.start(giveawayChannel, options);
      return `Giveaway bắt đầu trong ${giveawayChannel}`;
    } catch(error) {
      console.log(error);
      return `Đã xảy ra lỗi khi bắt đầu giveaway: ${error}`;
    };
  };
  // 
  async pause(member, messageId) {
    if (!messageId) return "Bạn phải cung cấp id tin nhắn hợp lệ.";
    if (!member.permissions.has("ManageMessages")) return "Bạn cần có quyền quản lý tin nhắn để quản lý giveaway.";
    const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === member.guild.id);
    if (!giveaway) return `Không thể tìm thấy quà tặng cho messageId: ${messageId}`;
    if (giveaway.pauseOptions.isPaused) return "Giveaway này đã được tạm dừng.";
    try {
      await giveaway.pause();
      return "Thành công! Giveaway đã tạm dừng!";
    } catch (error) {
      return `Đã xảy ra lỗi khi tạm dừng giveaway: ${error.message}`;
    };
  };
  // 
  async resume(member, messageId) {
    if (!messageId) return "Bạn phải cung cấp id tin nhắn hợp lệ.";
    if(!member.permissions.has("ManageMessages")) return "Bạn cần có quyền quản lý tin nhắn để quản lý giveaway.";
    const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === member.guild.id);
    if (!giveaway) return `Không thể tìm thấy giveaway cho messageId: ${messageId}`;
    if (!giveaway.pauseOptions.isPaused) return "Giveaway này không được tạm dừng.";
    try {
      await giveaway.unpause();
      return "Thành công! Giveaway đã hủy tạm dừng!";
    } catch(error) {
      return `Đã xảy ra lỗi khi hủy tạm dừng giveaway: ${error.message}`;
    };
  };
  //
  async reroll(member, messageId) {
    if(!messageId) return "Bạn phải cung cấp id tin nhắn hợp lệ.";
    if(!member.permissions.has("ManageMessages")) return "Bạn cần có quyền quản lý tin nhắn để bắt đầu giveaways.";
    const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === member.guild.id);
    if(!giveaway) return `Không thể tìm thấy giveaway cho messageId: ${messageId}`;
    if(!giveaway.ended) return "Giveaway vẫn chưa kết thúc.";
    try {
      await giveaway.reroll();
      return "Giveaway rerolled!";
    } catch (error) {
      return `Đã xảy ra lỗi khi bắt đầu lại giveaway: ${error.message}`;
    }
  };
  //
  async list(member) {
    if(!member.permissions.has("ManageMessages")) return "Bạn cần có quyền quản lý tin nhắn để quản lý quà tặng.";
    const giveaways = this.client.giveawaysManager.giveaways.filter((g) => g.guildId === member.guild.id && g.ended === false);
    if(giveaways.length === 0) return "Không có giveaway nào chạy trong máy chủ này.";
    const description = giveaways.map((g, i) => `${i + 1}. ${g.prize} in <#${g.channelId}>`).join("\n");
    try {
      return { embeds: [{ description, color: "Random" }] };
    } catch (error) {
      return `Đã xảy ra lỗi khi liệt kê giveaway: ${error.message}`;
    }
  };
  // 
  async end(member, messageId) {
    if (!messageId) return "Bạn phải cung cấp id tin nhắn hợp lệ.";
    if(!member.permissions.has("ManageMessages")) return "Bạn cần có quyền quản lý tin nhắn để bắt đầu tặng quà.";
    const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === member.guild.id);
    if(!giveaway) return `Không thể tìm thấy giveaway cho messageId: ${messageId}`;
    if(giveaway.ended) return "Giveaway đã kết thúc.";
    try {
      await giveaway.end();
      return "Thành công! Giveaway đã kết thúc!";
    } catch (error) {
      return `Đã xảy ra lỗi khi kết thúc giveaway: ${error.message}`;
    };
  };
  //
  async edit(member, messageId, addDuration, newPrize, newWinnerCount) {
    if (!messageId) return "Bạn phải cung cấp id tin nhắn hợp lệ.";
    if(!member.permissions.has("ManageMessages")) return "Bạn cần có quyền quản lý tin nhắn để bắt đầu giveaway.";
    const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === member.guild.id);
    if(!giveaway) return `Không thể tìm thấy giveaway cho messageId: ${messageId}`;
    try {
      await this.client.giveawaysManager.edit(messageId, {
        addTime: addDuration || 0,
        newPrize: newPrize || giveaway.prize,
        newWinnerCount: newWinnerCount || giveaway.winnerCount,
      });
      return `Đã cập nhật thành công giveaway!`;
    } catch (error) {
      return `Đã xảy ra lỗi khi cập nhật giveaway: ${error.message}`;
    };
  };
  // 
  async runModalSetup({ member, channel, guild }, targetCh) {
    if(!targetCh) return channel.send("Giveaway setup has been cancelled. You did not mention a channel");
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
    }).catch((ex) => {});
    if(!btnInteraction) return sentMsg.edit({ 
      content: "Không nhận được phản hồi, đang hủy thiết lập",
      components: [] 
    });
    
    await btnInteraction.showModal(new ModalBuilder({
      customId: "giveaway-modalSetup",
      title: "Thiết lập Giveaway",
      components: [
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("duration").setLabel("thời lượng là bao lâu?").setPlaceholder("1h / 1d / 1w").setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("prize").setLabel("Giải thưởng là gì?").setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("winners").setLabel("Số người chiến thắng?").setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("roles").setLabel("RoleId có thể tham gia giveaway").setStyle(TextInputStyle.Short).setRequired(false)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("host").setLabel("Id người dùng lưu trữ giveaway").setStyle(TextInputStyle.Short).setRequired(false)),
      ],
    }));

    const modal = await btnInteraction.awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "giveaway-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    }).catch((ex) => {});
    if(!modal) return sentMsg.edit({ content: "Không nhận được phản hồi, đang hủy thiết lập", components: [] });
    sentMsg.delete().catch(() => {});
    await modal.reply("Thiết lập giveaway...");
    const duration = ems(modal.fields.getTextInputValue("duration"));
    if(isNaN(duration)) return modal.editReply("Thiết lập đã bị hủy bỏ. Bạn đã không chỉ định thời hạn hợp lệ");
    // phần thưởng
    const prize = modal.fields.getTextInputValue("prize");
    // số người chiến thắng
    const winners = parseInt(modal.fields.getTextInputValue("winners"));
    if (isNaN(winners)) return modal.editReply("Thiết lập đã bị hủy. Bạn không chỉ định số lượng người chiến thắng hợp lệ");
    // roles
    const allowedRoles = modal.fields.getTextInputValue("roles")?.split(",")?.filter((roleId) => guild.roles.cache.get(roleId.trim())) || [];
    const hostId = modal.fields.getTextInputValue("host");
    let host = null;
    if (hostId) {
      try {
        host = await this.client.users.fetch(hostId);
      } catch (ex) {
        return modal.editReply("Thiết lập đã bị hủy. Bạn cần cung cấp userId hợp lệ cho máy chủ");
      };
    };
    const response = await this.start(member, targetCh, duration, prize, winners, host, allowedRoles); 
    await modal.editReply(response);
  };
  // 
  async runModalEdit(message, messageId) {
    const { member, channel } = message;
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
    await modal.reply("Updating the giveaway...");
    // thời gian
    const addDuration = ems(modal.fields.getTextInputValue("duration"));
    if(isNaN(addDuration)) return modal.editReply("Cập nhật đã bị hủy bỏ. Bạn đã không chỉ định thời lượng thêm hợp lệ");
    // phần thưởng
    const newPrize = modal.fields.getTextInputValue("prize");
    // số người chiến thắng
    const newWinnerCount = parseInt(modal.fields.getTextInputValue("winners"));
    if(isNaN(newWinnerCount)) return modal.editReply("Cập nhật đã bị hủy bỏ. Bạn đã không chỉ định số lượng người chiến thắng hợp lệ");
    const response = await this.edit(message.member, messageId, addDuration, newPrize, newWinnerCount);
    await modal.editReply(response);
  };
};

module.exports = {
  onCoolDown, disspace, setupDatabase, baseURL, GiveawayClass,
};