const { EmbedBuilder, StringSelectMenuBuilder, parseEmoji, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType, Collection, SelectMenuBuilder } = require("discord.js");
const { Database } = require("st.db");
const fetch = require("node-fetch");
const ms = require("enhanced-ms");
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});
/*========================================================
# khởi tạo database cho guilds
========================================================*/
const setupDatabase = async(guild) => {
  const checkData = await database.has(guild.id);
  if(!checkData) { // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
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
        ChannelAutoCreateVoice: "",            // 7: thiết lập id channel voice 
        Djroles: [],                           // 8: thiết lập role chuyên nhạc                  
      },
      setDefaultWelcomeGoodbyeData: {          // thiết lập welcome, googbye, 
        WelcomeChannel: "",
        GoodbyeChannel: "",
        AutoAddRoleWel: [], 
      },
    });
  };
};
// tạo thời gian hồi lệnh
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
// music handlet
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
# ticket Handlers
========================================================*/
const sourcebin = require("sourcebin_js");
const settings = {
  ticket: {
    limit: 10,
    categories: {
      name: ""
    },
  },
};
const openPerms = ["ManageChannels"];
const closePerms = ["ManageChannels", "ReadMessageHistory"];
const isTicketChannel = (channel) => {
  return (channel.type === ChannelType.GuildText && channel.name.startsWith("tіcket-") && channel.topic && channel.topic.startsWith("tіcket|"));
};
const getTicketChannels = (guild) => {
  return guild.channels.cache.filter((ch) => isTicketChannel(ch));
};
const getExistingTicketChannel = (guild, userId) => {
  const tktChannels = getTicketChannels(guild);
  return tktChannels.filter((ch) => ch.topic.split("|")[1] === userId).first();
};

const closeTicket = async(channel, closedBy, reason) => {
      if(!channel.deletable || !channel.permissionsFor(channel.guild.members.me).has(closePerms)) return "missingPermissions";
      try {
        const messages = await channel.messages.fetch();
        const reversed = Array.from(messages.values()).reverse();
        let content = "";
        reversed.forEach((m) => {
          content += `[${new Date(m.createdAt).toLocaleString("vi-VN")}] - ${m.author.tag}\n`;
          if(m.cleanContent !== "") content += `${m.cleanContent}\n`;
          if(m.attachments.size > 0) content += `${m.attachments.map((att) => att.proxyURL).join(", ")}\n`;
          content += "\n";
        });
        const postToBin = async(content, title = `Nhật ký ticket cho ${channel.name}`) => {
          try {
            const response = await sourcebin.create([{ name: " ", content, languageId: "text" }], { title, description: " " });
            return {
              url: response.url,
              short: response.short,
              raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
            };
          } catch (ex) {
            console.log(`postToBin`, ex);
          };
        };
        const logsUrl = await postToBin(content);
        const parseTicketDetails = async(channel) => {
          if(!channel.topic) return;
          const split = channel.topic?.split("|");
          const catName = split[2] || "Mặc định";
          const user = await channel.client.users.fetch(split[1], { 
            cache: false 
          }).catch(() => {});
          return { user, catName };
        };
        const ticketDetails = await parseTicketDetails(channel);
        const components = [];
        if(logsUrl) {
          components.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Lịch sử tin nhắn").setURL(logsUrl.short).setStyle(ButtonStyle.Link)));
        };
        if (channel.deletable) await channel.delete();
        const embed = new EmbedBuilder().setAuthor({ name: "Đóng Ticket" }).setColor("Red");
        const fields = [];
        if(reason) fields.push({ name: "Lý do", value: reason, inline: false });
        fields.push(
          { name: "mở bởi", value: ticketDetails.user ? ticketDetails.user.tag : "Không xác định", inline: true },
          { name: "đóng bởi", value: closedBy ? closedBy.tag : "Không xác định", inline: true }
        );
        embed.setFields(fields);
        // gửi Embed cho người dùng
        if(ticketDetails.user) {
          ticketDetails.user.send({ embeds: [embed.setDescription(`**Tên server:** ${channel.guild.name}\n**Thể loại:** ${ticketDetails.catName}`).setThumbnail(channel.guild.iconURL())], components }).catch((ex) => {});
        };
        return "SUCCESS";
      } catch (ex) {
        console.log("closeTicket", ex);
        return "ERROR";
      };
}; 
const closeAllTickets = async(guild, author) => {
    const channels = getTicketChannels(guild);
    let success = 0, failed = 0;
    for (const ch of channels) {
      const status = await closeTicket(ch[1], author, "Buộc đóng tất cả các ticket đang mở");
      if (status === "SUCCESS") {
        success += 1;
      } else failed += 1;
    };
    return [success, failed];
};
const ticketHandler = class {
  constructor() {
   this.closePerms = ["ManageChannels", "ReadMessageHistory"];
   this.openPerms = ["Administrator"];
  };
  async handleTicketOpen(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { guild, user } = interaction;
    if(!guild.members.me.permissions.has(openPerms)) return interaction.editReply("Không thể tạo kênh ticket, thiếu quyền `Quản lý kênh`. Hãy liên hệ với người quản lý máy chủ để được trợ giúp!");
    const alreadyExists = getExistingTicketChannel(guild, user.id);
    if(alreadyExists) return interaction.editReply(`Bạn đã có một ticket đang mở`);
    // kiểm tra giới hạn
    const existing = getTicketChannels(guild).size;
    if(existing > settings.ticket.limit) return interaction.editReply("Có quá nhiều ticket đang mở. Hãy thử lại sau");
    // kiểm tra danh mục
    let catName = null;
    let catPerms = [];
    const categories = settings.ticket.categories;
    if(categories.length > 0) {
      const options = [];
      settings.ticket.categories.forEach((cat) => options.push({ label: cat.name, value: cat.name }));
      await interaction.editReply({ 
        content: "Vui lòng chọn loại ticket",
        components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("ticket-menu").setPlaceholder("Chọn loại ticket").addOptions(options))] 
      });
      const res = await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 60 * 1000,
      }).catch((err) => {
        if(err.message.includes("time")) return;
      });
      if(!res) return interaction.editReply({ content: "Hết giờ. Thử lại", components: [] });
      await interaction.editReply({ content: "Xử lý", components: [] });
      catName = res.values[0];
      catPerms = categories.find((cat) => cat.name === catName) || [];
    };
    try {
      const permissionOverwrites = [
        { id: guild.roles.everyone, deny: ["ViewChannel"] },
        { id: user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
        { id: guild.members.me.roles.highest.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
      ];
      if(catPerms?.length > 0) {
        catPerms?.forEach((roleId) => {
          const role = guild.roles.cache.get(roleId);
          if(!role) return;
          permissionOverwrites.push({
            id: role,
            allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
          });
        });
      };
      const countTicket = (existing + 1).toString();
      const tktChannel = await guild.channels.create({
        name: `tіcket-${countTicket}`,
        type: ChannelType.GuildText,
        topic: `tіcket|${user.id}|${catName || "Mặc định"}`,
        permissionOverwrites,
      });
      const sent = await tktChannel.send({ 
        content: user.toString(), 
        embeds: [new EmbedBuilder().setAuthor({ name: `Ticket #${countTicket}` }).setDescription(`Xin chào ${user.toString()}\nNhân viên hỗ trợ sẽ đến với bạn trong thời gian ngắn\n${catName ? `\n**Loại:** ${catName}` : ""}`).setFooter({ text: "Bạn có thể đóng ticket của mình bất cứ lúc nào bằng cách nhấp vào nút bên dưới" })],
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Hủy Ticket").setCustomId("TicketClose").setEmoji("🔒").setStyle(ButtonStyle.Primary))] 
      });
      user.send({ 
        embeds: [new EmbedBuilder().setColor("Random").setAuthor({ name: "Ticket Created" }).setThumbnail(guild.iconURL()).setDescription(`**Máy chủ:** ${guild.name}\n${catName ? `**Loại:** ${catName}` : ""}`)], 
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Xem kênh ticket").setURL(sent.url).setStyle(ButtonStyle.Link))]
      }).catch((ex) => {});
      await interaction.editReply({
        content: `Đã tạo Ticket! hãy bấm vào nút bên dưới để di chuyển đến kênh của bạn 🎫, sau 5 giây tin nhắn sẽ tự động được xoá`,
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("xem kênh ticket").setURL(sent.url).setStyle(ButtonStyle.Link).setEmoji("1091770710915022858"))],
      }).then(() => setTimeout(() => interaction.deleteReply(), 5000));
    } catch(ex) {
      console.log(ex);
      return interaction.editReply("Không thể tạo kênh ticket, đã xảy ra lỗi!");
    };
  };
  async handleTicketClose(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const status = await closeTicket(interaction.channel, interaction.user);
    if(status === "missingPermissions") {
      return interaction.editReply("Không thể đóng ticket, thiếu quyền. Hãy liên hệ với người quản lý máy chủ để được trợ giúp!");
    } else if(status == "ERROR") {
      return interaction.editReply("Không thể đóng vé, đã xảy ra lỗi!");
    };
  };
  async ticketModalSetup({ guild, channel, member }, ChannelId) {
    const sentMsg = await channel.send({
      content: "Vui lòng bấm vào nút bên dưới để thiết lập tin nhắn ticket",
      components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel("cài đặt tin nhắn").setStyle(ButtonStyle.Primary))],
    });
    if(!sentMsg) return;
    const btnInteraction = await channel.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    }).catch((ex) => {});
    if(!btnInteraction) return sentMsg.edit({ content: "Không nhận được phản hồi, đang hủy thiết lập", components: [] });
    await btnInteraction.showModal(new ModalBuilder({
      customId: "ticket-modalSetup",
      title: "Thiết lập Ticket",
      components: [
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("title").setLabel("Tiêu đề Embed").setStyle(TextInputStyle.Short).setRequired(false)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("description").setLabel("Mô tả Embed").setStyle(TextInputStyle.Paragraph).setRequired(false)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("footer").setLabel("Chân trang Embed").setStyle(TextInputStyle.Short).setRequired(false)),
      ],
    }));
    const modal = await btnInteraction.awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    }).catch((ex) => {});
    if(!modal) return sentMsg.edit({ content: "Không nhận được phản hồi, đang hủy thiết lập", components: [] });
    await modal.reply("Thiết lập tin nhắn ticket ...");
    await channel.send({
      embeds: [new EmbedBuilder()
        .setColor("Random")
        .setAuthor({ name: modal.fields.getTextInputValue("title") || "Ticket" })
        .setDescription(modal.fields.getTextInputValue("description") || "Vui lòng sử dụng nút bên dưới để tạo ticket")
        .setFooter({ text: modal.fields.getTextInputValue("footer") || "Bạn chỉ có thể mở 1 ticket tại một thời điểm!" })
      ], 
      components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Mở ticket").setCustomId("TicketCreate").setStyle(ButtonStyle.Success))] 
    });
    await modal.deleteReply();
    await sentMsg.edit({ content: "Xong! Đã tạo thông báo ticket", components: [] });
  };
  /**  */
  async close({ channel }, author) {
    if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
    const status = await closeTicket(channel, author, "Đã đóng bởi người kiểm duyệt");
    if (status === "missingPermissions") return "Tôi không có quyền đóng tickets";
    if (status === "ERROR") return "Đã xảy ra lỗi khi đóng ticket";
    return null;
  };
  /**  */
  async closeAll({ guild }, user) {
    const stats = await closeAllTickets(guild, user);
    return `Xong!, Thành công: \`${stats[0]}\` Thất bại: \`${stats[1]}\``;
  };
  /**  */
  async addToTicket({ channel }, inputId) {
    if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
    if (!inputId || isNaN(inputId)) return "Oops! Bạn cần nhập một giá trị hợp lệ userId/roleId";
    try {
      await channel.permissionOverwrites.create(inputId, {
        ViewChannel: true,
        SendMessages: true,
      });
      return `Đã thêm thành viên <@${inputId}> vào ticket`;
    } catch (ex) {
      return "Không thể thêm người dùng/Roles. Bạn đã cung cấp ID hợp lệ chưa?";
    };
  };
  /***/
  async removeFromTicket({ channel }, inputId) {
    if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
    if (!inputId || isNaN(inputId)) return "Bạn cần nhập một giá trị hợp lệ userId/roleId";
    try {
      channel.permissionOverwrites.create(inputId, {
        ViewChannel: false,
        SendMessages: false,
      });
      return "Đã xoá thành viên ra khỏi ticket!";
    } catch (ex) {
      return "Không thể xóa người dùng hoặc roles. Bạn có cung cấp ID hợp lệ không?";
    };
  };
};
/*========================================================
# EconomyHandler
========================================================*/
const EconomyHandler = class {
  constructor(options) {
    this.database = new Database(options.EcoPath, { 
      databaseInObject: true 
    });
    // ===================================================================
    this.formats = options.setFormat; // thiết lập phân loại tiền tệ các nước
    this.workCooldown = 0; // work, info
    this.maxWallet = 0; // setMaxWalletAmount
    this.maxBank = 0; // setMaxBankAmount, amount, findUser, makeUser
    this.wallet = 0; // makeUser, setDefaultWalletAmount
    this.bank = 0; // makeUser, setDefaultBankAmount
    // ===================================================================
    this.setDefaultWalletAmount(options.setDefaultWalletAmount); // ví tiền
    this.setDefaultBankAmount(options.setDefaultBankAmount); // ngân hàng
    this.setMaxWalletAmount(options.setMaxWalletAmount); // giớ hạn tiền của ví
    this.setMaxBankAmount(options.setMaxBankAmount); // giới hạn gởi tiền ngân hàng
  };
  // ===================================================================
  formatter(money) {
    const c = new Intl.NumberFormat(this.formats[0], {
      style: 'currency',
      currency: this.formats[1],
    });
    return c.format(money);
  };
  // ===================================================================
  setDefaultWalletAmount(amount) {
    if(parseInt(amount)) this.wallet = amount || 0;
  };
  // ===================================================================
  setDefaultBankAmount(amount) {
    if(parseInt(amount)) this.bank = amount || 0;
  };
  // ===================================================================
  setMaxBankAmount(amount) {
    if(parseInt(amount)) this.maxBank = amount || 0;
  };
  // ===================================================================
  setMaxWalletAmount(amount) {
    if(parseInt(amount)) this.maxWallet = amount || 0;
  };
  /*====================================================================
  # global.js 👨‍💻
  ====================================================================*/
  parseSeconds(seconds) {
    if(String(seconds).includes("-")) return "0 giây";
    let days = parseInt(seconds / 86400);
    seconds = seconds % 86400;
    let hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);
    if(days) {
      return `${days} ngày, ${hours} giờ, ${minutes} phút`;
    } else if(hours) {
      return `${hours} giờ, ${minutes} phút, ${seconds} giây`;
    } else if(minutes) {
      return `${minutes} phút, ${seconds} giây`;
    };
    return `${seconds} giây`;
  };
  /*====================================================================
  # management.js 👨‍💻👨‍💻
  ====================================================================*/
  async makeUser(settings) {
    const newUser = await this.database.set(settings.id, {
      userName: settings.username,
      userID: settings.id,
      wallet: this.wallet || 0,
      bank: this.bank || 0,
      bankSpace: this.maxBank || 0,
      networth: 0,
      bankSpace: 0,
      inventory: [],
      streak: {
        hourly: 1,
        daily: 1,
        weekly: 1,
        monthly: 1,
        yearly: 1,
        hafly: 1,
        quaterly: 1,
      },
      timeline: {
        begTimeout: 240,
        lastUpdated: new Date(),
        lastHourly: 0,
        lastQuaterly: 0,
        lastHafly: 0,
        lastRob: 0,
        lastDaily: 0,
        lastWeekly: 0,
        lastMonthly: 0,
        lastYearly: 0,
        lastBegged: 0,
        lastWork: 0,
      },
    });
    if(!newUser) {
      console.error("Thiếu dữ liệu để tìm nạp từ DB. (Một chức năng trong Hệ thống được sử dụng và ID người dùng không được cung cấp.)");
    };
    return newUser;
  };
  // ===================================================================
  async findUser(settings) {
    if(typeof settings.user === "string") {
      settings.user = {
        id: settings.user,
      };
    };
    if(!await this.database.has(settings.user.id)) {
      await this.makeUser(settings.user);
    };
    const find = await this.database.get(settings.user.id);
    if(this.maxBank > 0 && find.bankSpace == 0) find.bankSpace = this.maxBank;
    if(!find.streak) find.streak = {};
    if(!find.streak.hourly) find.streak.hourly = 0;
    if(!find.streak.daily) find.streak.daily = 0;
    if(!find.streak.weekly) find.streak.weekly = 0;
    if(!find.streak.monthly) find.streak.monthly = 0;
    if(!find.streak.yearly) find.streak.yearly = 0;
    if(!find.streak.hafly) find.streak.hafly = 0;
    if(!find.streak.quaterly) find.streak.quaterly = 0;
    return find;
  };
  // ===================================================================
  async addMoney(settings) {
    let data = await this.findUser(settings);
    if (String(settings.amount).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    let amountt = parseInt(settings.amount) || 0;
    if(settings.wheretoPutMoney === "bank") {
      data = this.amount(data, "add", "bank", amountt);
    } else {
      data = this.amount(data, "add", "wallet", amountt);
    };
    await this.database.set(settings.user.id, data);
    return {
      error: false,
      type: "success",
      rawData: data,
    };
  };
  // ===================================================================
  async removeMoney(settings) {
    let data = await this.findUser(settings);
    if(String(settings.amount).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    if(settings.wheretoPutMoney === "bank") {
      if(settings.amount === "all" || settings.amount === "max") {
        data.bank = 0;
      } else {
        data = this.amount(data, "remove", "bank", parseInt(settings.amount) || 0);
      };
    } else {
      if(settings.amount === "all" || settings.amount === "max") {
        data.wallet = 0;
      } else {
        data = this.amount(data, "remove", "wallet", parseInt(settings.amount) || 0);
      };
    };
    await this.database.set(settings.user.id, data);
    return {
      error: false,
      type: "success",
      rawData: data,
    };
  }
  // ===================================================================
  amount(data, type = "add", where = "wallet", amount, by) {
    if(!data.bankSpace) data.bankSpace = this.maxBank || 0;
    if(where === "bank") {
      if (type === "add") {
        data.bank += amount;
      } else data.bank -= amount;
    } else {
      if(type === "add") {
        data.wallet += amount;
      } else data.wallet -= amount;
    }
    if(data.bankSpace > 0 && data.bank > data.bankSpace) {
      data.bank = data.bankSpace;
      data.wallet += Math.abs(data.bank - data.bankSpace);
    };
    if (!data.networth) data.networth = 0;
    data.networth = data.bank + data.wallet;
    return data;
  };
  // ===================================================================
  async withdraw(settings) {
    let data = await this.findUser(settings);
    let money = String(settings.amount);
    if(!money) return {
      error: true,
      type: "money",
    };
    if(money.includes("-")) return {
      error: true,
      type: "negative-money",
    };
    if(money === "all" || money === "max") {
      if(data.bank < 1) return {
        error: true,
        type: "no-money",
      };
      data.wallet += data.bank;
      data.bank = 0;
      if(!data.networth) data.networth = 0;
      data.networth = data.bank + data.wallet;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        rawData: data,
        type: "all-success",
      };
    } else {
      money = parseInt(money);
      if(data.bank < parseInt(money)) return {
        error: true,
        type: "low-money",
      };
      if(isNaN(money)) return {
        error: true,
        type: "money",
      };
      if(money > data.bank) return {
        error: true,
        type: "low-money",
      };
      data.wallet += money;
      data.bank -= money;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: money,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async deposite(settings) {
    let data = await this.findUser(settings);
    let money = String(settings.amount);
    if(!money) return {
      error: true,
      type: "money",
    };
    if(String(money).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    if(money === "all" || money === "max") {
      if(data.wallet === 0) return {
        error: true,
        type: "no-money",
      };
      if(data.bankSpace > 0 && money === "all" && data.bank === data.bankSpace) return {
        error: true,
        rawData: data,
        type: "bank-full",
      };
      data.bank += data.wallet;
      data.wallet = 0;
      if(data.bankSpace > 0 && data.bank > data.bankSpace) {
        const a = data.bank;
        data.bank = data.bankSpace;
        data.wallet += Math.abs(a - data.bankSpace);
      };
      if (!data.networth) data.networth = 0;
      data.networth = data.bank + data.wallet;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        rawData: data,
        type: "all-success",
      };
    } else {
      money = parseInt(money);
      if(!money) return {
        error: true,
        type: "money",
      };
      if(money > data.wallet) return {
        error: true,
        type: "low-money",
      };
      if(data.bankSpace > 0 && data.bank == data.bankSpace) return {
        error: true,
        type: "bank-full",
        rawData: data,
      };
      data.bank += money;
      if(data.wallet - money < 0) {
        const a = data.wallet;
        data.wallet = 0;
        data.bank -= Math.abs(a - money);
      };
      data.wallet -= money;
      if(!data.networth) data.networth = 0;
      data.networth = data.bank + data.wallet;
      if(data.bankSpace > 0 && data.bank > data.bankSpace) {
        data.bank = data.bankSpace;
        data.wallet += Math.abs(data.bank - data.bankSpace);
      };
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        rawData: data,
        type: "success",
        amount: money,
      };
    };
  };
  // ===================================================================
  async transferMoney(settings) {
      if(typeof settings.user === "string") {
        settings.user = {
          id: settings.user,
        };
      };
      let user1 = await this.findUser(settings);
      let user2 = await this.database.get(settings.user2.id);
      if(!user2) {
        return await this.makeUser(settings.user2);
      };
      let money = parseInt(settings.amount);
      if(user1.wallet < money) return {
        error: true,
        type: "low-money",
      };
      user1 = this.amount(user1, "remove", "wallet", money);
      user2 = this.amount(user2, "add", "wallet", money);
      await this.database.set(settings.user.id, user1).catch((ex) => {});
      await this.database.set(settings.user2.id, user2).catch((ex) => {});
      return {
        error: false,
        type: "success",
        money: money,
        user: settings.user,
        user2: settings.user2,
        rawData: user1,
        rawData1: user2,
      };
  };
  /*====================================================================
  # informative.js 👨‍💻👨‍💻👨‍💻
  ====================================================================*/
  async balance(settings) {
    let data = await this.findUser(settings);
    if(!data.networth) data.networth = 0;
    data.networth = data.wallet + data.bank;
    return {
      rawData: data,
      bank: data.bank,
      wallet: data.wallet,
      networth: data.networth,
    };
  };
  //====================================================================
  async globalLeaderboard() {
    let array = this.database.valuesAll();
    var output = [];
    array.forEach((item) => {
      var existing = output.find((v, i) => {
        return v.userID == item.userID;
      });
      if(existing) {
        var existingIndex = output.indexOf(existing[0]);
        output[existingIndex].bank = output[existingIndex].bank + item.bank;
        output[existingIndex].wallet = output[existingIndex].wallet + item.wallet;
        output[existingIndex].networth = output[existingIndex].wallet + output[existingIndex].bank;
      } else {
        output.push(item);
      }
    });
    output.sort((a, b) => {
      return b.networth - a.networth;
    });
    return output;
  };
  /*====================================================================
  # moneyMaking.js 👨‍💻👨‍💻👨‍💻👨‍💻
  ====================================================================*/
  async work(settings) {
    let data = await this.findUser(settings);
    let lastWork = data.timeline.lastWork;
    let timeout = settings.cooldown;
    this.workCooldown = timeout;
    if(lastWork !== null && timeout - (Date.now() - lastWork) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - lastWork) / 1000)),
      };
    } else {
      let amountt = Math.floor(Math.random() * settings.maxAmount || 100) + 1;
      data.timeline.lastWork = Date.now();
      data = this.amount(data, "add", "wallet", amountt);
      await this.database.set(settings.user.id, data);
      let result = Math.floor(Math.random() * settings.replies.length);
      return {
        error: false,
        type: "success",
        workType: settings.replies[result],
        amount: amountt,
      };
    };
  }
  //====================================================================
  async hourly(settings) {
    let data = await this.findUser(settings);
    let lastHourly = data.timeline.lastHourly;
    let timeout = 3600;
    if(lastHourly !== null && timeout - (Date.now() - lastHourly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - lastHourly) / 1000)),
      };
    } else {
      data.timeline.lastHourly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - lastHourly) / 1000 > timeout * 2) data.streak.hourly = 0;
      data.streak.hourly += 1;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async weekly(settings) {
    let data = await this.findUser(settings);
    let weekly = data.timeline.lastWeekly;
    let timeout = 604800;
    if(weekly !== null && timeout - (Date.now() - weekly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - weekly) / 1000)),
      };
    } else {
      data.timeline.lastWeekly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - data.lastWeekly) / 1000 > timeout * 2) data.streak.weekly = 0;
      data.streak.weekly += 1;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  }
  // ===================================================================
  async monthly(settings) {
    let data = await this.findUser(settings);
    let monthly = data.timeline.lastMonthly;
    let timeout = 2.592e6;
    if(monthly !== null && timeout - (Date.now() - monthly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - monthly) / 1000)),
      };
    } else {
      data.timeline.lastMonthly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - monthly) / 1000 > timeout * 2) data.streak.monthly = 0;
      data.streak.monthly += 1;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async yearly(settings) {
    let data = await this.findUser(settings);
    let yearly = data.timeline.lastYearly;
    let timeout = 31536000000;
    if(yearly !== null && (timeout - (Date.now() - yearly)) / 1000 >= 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor((timeout - (Date.now() - yearly)) / 1000)),
      };
    } else {
      data.timeline.lastYearly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - yearly) / 1000 > timeout * 2) data.streak.yearly = 0;
      data.streak.yearly += 1;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async quaterly(settings) {
    let data = await this.findUser(settings);
    let quaterly = data.timeline.lastQuaterly;
    let timeout = 21600;
    if(quaterly !== null && timeout - (Date.now() - quaterly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - quaterly) / 1000)),
      };
    } else {
      data.timeline.lastQuaterly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - quaterly) / 1000 > timeout * 2) data.streak.quaterly = 0;
      data.streak.quaterly += 1;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async hafly(settings) {
    let data = await this.findUser(settings);
    let hafly = data.timeline.lastHafly;
    let timeout = 43200;
    if(hafly !== null && timeout - (Date.now() - hafly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - hafly) / 1000)),
      };
    } else {
      data.timeline.lastHafly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if ((Date.now() - data.timeline.lastHafly) / 1000 > timeout * 2) data.streak.hafly = 0;
      data.streak.hafly += 1;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async daily(settings) {
    let data = await this.findUser(settings);
    let daily = data.timeline.lastDaily;
    let timeout = 86400;
    if(daily !== null && timeout - (Date.now() - daily) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - daily) / 1000)),
      };
    } else {
      data.timeline.lastDaily = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - daily) / 1000 > timeout * 2) data.streak.daily = 0;
      data.streak.daily += 1;
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async beg(settings) {
    let data = await this.findUser(settings);
    let beg = data.timeline.lastBegged;
    let timeout = 240;
    if (parseInt(settings.cooldown)) timeout = parseInt(settings.cooldown);
    if(beg !== null && timeout - (Date.now() - beg) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - beg) / 1000)),
      };
    } else {
      const amountt = Math.round((settings.minAmount || 200) + Math.random() * (settings.maxAmount || 400));
      data.timeline.lastBegged = Date.now();
      data.timeline.begTimeout = timeout;
      data = this.amount(data, "add", "wallet", amountt);
      await this.database.set(settings.user.id, data);
      return {
        error: false,
        type: "success",
        amount: amountt,
      };
    };
  };
  // ===================================================================
  async rob(settings) {
    function testChance(successPercentage) {
      let random = Math.random() * 10;
      return (random -= successPercentage) < 0;
    };
    if(typeof settings.user === "string") settings.user.id = settings.user;
    let user1 = await this.findUser(settings);
    if(!await this.database.has(settings.user2.id)) {
      await this.makeUser(settings);
    };
    let user2 = await this.database.get(settings.user2.id);
    let lastRob = user1.timeline.lastRob;
    let timeout = settings.cooldown;
    if(lastRob !== null && timeout - (Date.now() - lastRob) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - lastRob) / 1000)),
      };
    };
    if(user1.wallet < settings.minAmount - 2) {
      return {
        error: true,
        type: "low-money",
        minAmount: settings.minAmount,
      };
    };
    if(user2.wallet < settings.minAmount - 2) {
      return {
        error: true,
        type: "low-wallet",
        user2: settings.user2,
        minAmount: settings.minAmount,
      };
    };
    let max = settings.maxRob;
    if (!max || max < 1000) max = 1000;
    let random = Math.floor(Math.random() * (Math.floor(max || 1000) - 99)) + 99;
    if(random > user2.wallet) random = user2.wallet;
    user1.timeline.lastRob = Date.now();
    // 5 đây là phần trăm thành công.
    if(testChance(settings.successPercentage || 5)) {
      // Thành công!
      user2 = this.amount(user2, "remove", "wallet", random);
      user1 = this.amount(user1, "add", "wallet", random);
      await this.database.set(settings.user.id, user1).catch((ex) => {});
      await this.database.set(settings.user2.id, user2).catch((ex) => {});
      return {
        error: false,
        type: "success",
        user2: settings.user2,
        minAmount: settings.minAmount,
        amount: random,
      };
    } else {
      // Thất bại :(
      if(random > user1.wallet) random = user1.wallet;
      user2 = this.amount(user2, "add", "wallet", random);
      user1 = this.amount(user1, "remove", "wallet", random);
      await this.database.set(settings.user.id, user1).catch((ex) => {});
      await this.database.set(settings.user2.id, user2).catch((ex) => {});
      return {
        error: true,
        type: "caught",
        user2: settings.user2,
        minAmount: settings.minAmount,
        amount: random,
      };
    };
  };
  /*====================================================================
  # Test 👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻
  ====================================================================*/
};

module.exports = {
  onCoolDown, disspace, setupDatabase, baseURL,
  ticketHandler, EconomyHandler
};