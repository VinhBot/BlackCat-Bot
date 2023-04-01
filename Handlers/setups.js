// const { AttachmentBuilder, EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const config  = require(`${process.cwd()}/config.json`);
/*========================================================
# test ticket
========================================================*/
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, StringSelectMenuBuilder, ComponentType,   ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
// const sourcebin = require("sourcebin_js");
const settings = {
  ticket: {
    limit: 10,
    categories: {
      _id: false,
      name: "",
      staff_roles: [],
    },
  },
};

class ticketHandler {
  constructor() {
    this.openPerms = ["ManageChannels"];
    this.closePerms = ["ManageChannels", "ReadMessageHistory"];
  };
  /**
  * @param {import('discord.js').Channel} channel
  */
  isTicketChannel(channel) {
    return (channel.type === ChannelType.GuildText && channel.name.startsWith("tіcket-") && channel.topic && channel.topic.startsWith("tіcket|"));
  };
  /**
  * @param {import('discord.js').Guild} guild
  */
  getTicketChannels(guild) {
    return guild.channels.cache.filter((ch) => this.isTicketChannel(ch));
  };
  /**
  * @param {import('discord.js').Guild} guild
  * @param {string} userId
  */
  getExistingTicketChannel(guild, userId) {
    const tktChannels = this.getTicketChannels(guild);
    return tktChannels.filter((ch) => ch.topic.split("|")[1] === userId).first();
  };
  //
  async closeTicket(channel, closedBy, reason) {
      if(!channel.deletable || !channel.permissionsFor(channel.guild.members.me).has(this?.closePerms)) return "missingPermissions";
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
        // const logsUrl = await postToBin(content, `Nhật ký ticket cho ${channel.name}`);
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
          components.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Transcript").setURL(logsUrl.short).setStyle(ButtonStyle.Link)));
        };
        if (channel.deletable) await channel.delete();
        const embed = new EmbedBuilder().setAuthor({ name: "Đóng Ticket" }).setColor("Red");
        const fields = [];
        if(reason) fields.push({ name: "Reason", value: reason, inline: false });
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
  /**
  * @param {import('discord.js').Guild} guild
  * @param {import('discord.js').User} author
  */
  async closeAllTickets(guild, author) {
    const channels = this.getTicketChannels(guild);
    let success = 0, failed = 0;
    for (const ch of channels) {
      const status = await this.closeTicket(ch[1], author, "Buộc đóng tất cả các ticket đang mở");
      if (status === "SUCCESS") {
        success += 1;
      } else failed += 1;
    };
    return [success, failed];
  }
  /**
  * @param {import("discord.js").ButtonInteraction} interaction
  */
  async handleTicketOpen(interaction) {
    await interaction.reply({ content: "Đang khởi tạo" }).catch((ex) => {});
    const { guild, user } = interaction;
    if(!guild.members.me.permissions.has(this?.openPerms)) return interaction.editReply("Không thể tạo kênh ticket, thiếu quyền `Quản lý kênh`. Hãy liên hệ với người quản lý máy chủ để được trợ giúp!");
    const alreadyExists = this.getExistingTicketChannel(guild, user.id);
    if(alreadyExists) return interaction.editReply(`Bạn đã có một ticket đang mở`);
    // kiểm tra giới hạn
    const existing = this.getTicketChannels(guild).size;
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
        topic: `tіcket | ${user.id} | ${catName || "Mặc định"}`,
        permissionOverwrites,
      });
      const sent = await tktChannel.send({ 
        content: user.toString(), 
        embeds: [new EmbedBuilder().setAuthor({ name: `Ticket #${countTicket}` }).setDescription(`Xin chào ${user.toString()}\nNhân viên hỗ trợ sẽ đến với bạn trong thời gian ngắn\n${catName ? `\n**Loại:** ${catName}` : ""}`).setFooter({ text: "Bạn có thể đóng ticket của mình bất cứ lúc nào bằng cách nhấp vào nút bên dưới" })],
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Hủy Ticket").setCustomId("TicketClose").setEmoji("🔒").setStyle(ButtonStyle.Primary))] 
      });
      user.send({ 
        embeds: [new EmbedBuilder().setColor("Random").setAuthor({ name: "Ticket Created" }).setThumbnail(guild.iconURL()).setDescription(`**Máy chủ:** ${guild.name}\n${catName ? `**Loại:** ${catName}` : ""}`)], 
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("View Channel").setURL(sent.url).setStyle(ButtonStyle.Link))]
      }).catch((ex) => {});
      await interaction.editReply({ content: `Đã tạo Ticket! 🎫`, ephemeral: true });
    } catch(ex) {
      console.log(ex);
      return interaction.editReply("Không thể tạo kênh ticket, đã xảy ra lỗi!");
    };
  };
  /**
  * @param {import("discord.js").ButtonInteraction} interaction
  */
  async handleTicketClose(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const status = await this.closeTicket(interaction.channel, interaction.user);
    if(status === "missingPermissions") {
      return interaction.editReply("Không thể đóng ticket, thiếu quyền. Hãy liên hệ với người quản lý máy chủ để được trợ giúp!");
    } else if(status == "ERROR") {
      return interaction.editReply("Không thể đóng vé, đã xảy ra lỗi!");
    };
  };
  /**
  */
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
    if (!this.isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
    const status = await this.closeTicket(channel, author, "Đã đóng bởi người kiểm duyệt");
    if (status === "missingPermissions") return "Tôi không có quyền đóng tickets";
    if (status === "ERROR") return "Đã xảy ra lỗi khi đóng ticket";
    return null;
  }
  /**  */
  async closeAll({ guild }, user) {
    const stats = await this.closeAllTickets(guild, user);
    return `Hoàn thành!, Thành công: \`${stats[0]}\` Thất bại: \`${stats[1]}\``;
  };
  /**  */
  async addToTicket({ channel }, inputId) {
    if (!this.isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
    if (!inputId || isNaN(inputId)) return "Oops! Bạn cần nhập một giá trị hợp lệ userId/roleId";
    try {
      await channel.permissionOverwrites.create(inputId, {
        ViewChannel: true,
        SendMessages: true,
      });
      return "Xong!";
    } catch (ex) {
      return "Không thể thêm người dùng/Roles. Bạn đã cung cấp ID hợp lệ chưa?";
    };
  };
  /***/
  async removeFromTicket({ channel }, inputId) {
    if (!this.isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
    if (!inputId || isNaN(inputId)) return "Bạn cần nhập một giá trị hợp lệ userId/roleId";
    try {
      channel.permissionOverwrites.create(inputId, {
        ViewChannel: false,
        SendMessages: false,
      });
      return "Xong!";
    } catch (ex) {
      return "Không thể xóa người dùng hoặc roles. Bạn có cung cấp ID hợp lệ không?";
    };
  };
  /**
  * Đăng nội dung được cung cấp vào BIN
  * @param {string} content
  * @param {string} title
  */
  static async postToBin(content, title) {
    try {
      const response = await sourcebin.create([
        { name: " ", content, languageId: "text" },
        ], { title, description: " " });
      return {
        url: response.url,
        short: response.short,
        raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
      };
    } catch (ex) {
      console.log(`postToBin`, ex);
    };
  };
};

const { handleTicketOpen, handleTicketClose, ticketModalSetup } = new ticketHandler();

module.exports = (client) => {
  client.on("messageCreate", async(message) => {
    if(message.content === "ticket") {
      const ChannelId = "1090852217386442823";
      return ticketModalSetup(message, ChannelId);
    };
  });
  /*========================================================
  ========================================================*/
  client.on("interactionCreate", async(interaction) => {
    const { customId } = interaction;
    if(interaction.isButton()) {
      if(customId === "inviteBot") {
        interaction.reply({ content: `[Bấm vào đây](${config.discordBot})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      } else if(customId === "inviteDiscord") {
        interaction.reply({ content: `[Bấm vào đây](${config.discord})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      };
      /*========================================================
      # ticket handlers 🎫 🎟️
      ========================================================*/
      if(customId === "TicketCreate") {
        return handleTicketOpen(interaction);
      } else if(customId === "TicketClose") {
        return handleTicketClose(interaction);
      };
      /*========================================================
      # 
      ========================================================*/
    } else if(interaction.isStringSelectMenu()) {
      // help
    };
  });
};0