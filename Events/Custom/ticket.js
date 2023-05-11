const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelType, ButtonStyle, TextInputStyle, ComponentType } = require("discord.js");

module.exports = {
	eventName: "interactionCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, interaction) => {
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
    const ticketModalSetup = async({ channel, member }) => {
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
    async function close({ channel }, author) {
      if(!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
      const status = await closeTicket(channel, author, "Đã đóng bởi người kiểm duyệt");
      if(status === "missingPermissions") return "Tôi không có quyền đóng tickets";
      if(status === "ERROR") return "Đã xảy ra lỗi khi đóng ticket";
      return null;
    };
    /**  */
    async function closeAll({ guild }, user) {
      const stats = await closeAllTickets(guild, user);
      return `Xong!, Thành công: \`${stats[0]}\` Thất bại: \`${stats[1]}\``;
    };
    /**  */
    async function addToTicket({ channel }, inputId) {
      if(!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
      if(!inputId || isNaN(inputId)) return "Oops! Bạn cần nhập một giá trị hợp lệ userId/roleId";
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
    /** */
    async function removeFromTicket({ channel }, inputId) {
      if(!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
      if(!inputId || isNaN(inputId)) return "Bạn cần nhập một giá trị hợp lệ userId/roleId";
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
    /*========================================================
    # Clicker Handlers
    ========================================================*/
    if(interaction.isButton()) {
      if(interaction.customId === "TicketCreate") {
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
      } else if(interaction.customId === "TicketClose") {
        await interaction.deferReply({ ephemeral: true });
        const status = await closeTicket(interaction.channel, interaction.user);
        if(status === "missingPermissions") {
          return interaction.editReply("Không thể đóng ticket, thiếu quyền. Hãy liên hệ với người quản lý máy chủ để được trợ giúp!");
        } else if(status == "ERROR") {
          return interaction.editReply("Không thể đóng vé, đã xảy ra lỗi!");
        };
      };
    };
    /*========================================================
    # khởi chạy các func
    ========================================================*/
    client.ticketModalSetup = ticketModalSetup;
    client.removeFromTicket = removeFromTicket; 
    client.addToTicket = addToTicket; 
    client.ticketCloseAll = closeAll; 
    client.ticketClose = close; 
  },
};