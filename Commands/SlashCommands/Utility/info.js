const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType } = require("discord.js");

module.exports = {
  name: "info",
  description: "Nhận thông tin về một thứ gì đó",
  cooldown: 3,
  options: [{
      name: "invite",
      description: "nhận thông tin về người dùng",
      type: ApplicationCommandOptionType.Subcommand,
  },{
      name: "ping",
      description: "nhận thông tin về ping của bot",
      type: ApplicationCommandOptionType.Subcommand,
  },{
      name: "server",
      description: "nhận thông tin về server của bạn",
      type: ApplicationCommandOptionType.Subcommand,
  },{
      name: "avatar",
      description: "xem avatar người dùng",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "user",
          description: "Bạn muốn xem ảnh đại diện của ai nào?",
          type: ApplicationCommandOptionType.Mentionable,
          required: true,
      }],
  },{
      name: "roles",
      description: "nhận thông tin về một roles nào đó",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "roles",
          description: "Bạn muốn nhận thông tin từ roles nào?",
          type: ApplicationCommandOptionType.Role,
          required: true,
      }],
  }],
  run: async(client, interaction, Options) => {
    try {
      if(interaction.options.getSubcommand() === "avatar") {
        const member = interaction.options.getMentionable('user') || interaction.user;
        const avatar = member.displayAvatarURL({ size: 1024, dynamic: true });
        const PNGav = member.displayAvatarURL({ format: 'png', size: 1024 });
        const JPGav = member.displayAvatarURL({ format: 'jpg', size: 1024 });
        const WEBPav = member.displayAvatarURL({ format: 'webp', size: 1024 });
        const embed = new EmbedBuilder().setTitle('🖼️ Avatar').setColor('Random').setTimestamp().setImage(avatar).setURL(avatar);
        const row1 = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('PNG').setStyle(ButtonStyle.Link).setURL(PNGav))
        const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('JPG').setStyle(ButtonStyle.Link).setURL(JPGav))
        const row3 = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('DYNAMIC').setStyle(ButtonStyle.Link).setURL(avatar))
        const row4 = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('WEBP').setStyle(ButtonStyle.Link).setURL(WEBPav))
        interaction.reply({ embeds: [embed], components: [row1, row2, row3, row4] });
      } else if(interaction.options.getSubcommand() === "roleinfo") {
        var role = interaction.options.getRole("roles");
        if(!role || role == null || role.id == null || !role.id) return interaction?.reply({ content: "không thể tìm thấy role mà bạn yêu cầu hãy thử lại một lần nữa", ephemeral: true });
        const embeduserinfo = new EmbedBuilder()
        embeduserinfo.setThumbnail(interaction.member.guild.iconURL({ dynamic: true, size: 512 }))
        embeduserinfo.setAuthor({ name: `Thông tin : ${role.name}`, iconURL: `${interaction.member.guild.iconURL({ dynamic: true })}` })
        embeduserinfo.setColor(role.hexColor)
        embeduserinfo.addFields([
          { name: "Tên roles:", value: `\`${role.name}\`` },
          { name: "ID roles:", value: `\`${role.id}\`` },
          { name: "Màu roles:", value: `${role.hexColor}` },
          { name: "Tạo lúc:", value: `<t:${~~(role.createdAt / 1000)}:f>` },
          { name: "Vị trí:", value: `\`${role.rawPosition}\`` },
          { name: "Số thành viên có roles:", value: `\`${role.members.size} Các thành viên có nó\`` },
          { name: "Được nâng lên:", value: `\`${role.hoist ? "✔️" : "❌"}\`` },
          { name: "Có thể hỗ trợ:", value: `\`${role.mentionable ? "✔️" : "❌"}\`` },
          { name: "Các quyền của roles:", value: `${role.permissions.toArray().map(p =>`\`${p}\``).join(", ")}` },
        ]);
        interaction?.reply({ embeds: [embeduserinfo] });
      } else if(interaction.options.getSubcommand() === "invite") {
        interaction.reply({ ephemeral: true,
        embeds: [new EmbedBuilder()
          .setColor("Random")
          .setFooter({ text: Options.name, iconURL: Options.avatar })
          .setDescription(`[Bấm vào đây để mời tôi!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)\n\n||[Nhấp vào đây để mời tôi mà không có Lệnh Slash!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)||`)
        ]});
      } else if(interaction.options.getSubcommand() === "ping") {
        const pingImageArr = [
         "https://cdn.discordapp.com/attachments/892794857905602560/892794900863660062/63e1657a8a6249a2fc9c062b17f27ce0.gif",
         "https://cdn.discordapp.com/attachments/892794857905602560/892795017104613376/dc87c9ea90b4b7d02a0cbe5de256d385.gif",
         "https://cdn.discordapp.com/attachments/892794857905602560/892795143093108806/a665463e60ef772c82286e4ee6a15353.gif",
         "https://cdn.discordapp.com/attachments/892794857905602560/892795222986207293/4a3a4f44524556704c29879feeba0c23.gif",
         "https://cdn.discordapp.com/attachments/892794857905602560/892795292573913098/534d38d35eb761ad11e43fe378c3de29.gif",
         "https://cdn.discordapp.com/attachments/892794857905602560/892795346172928080/c17166b2af1a743b149e1eb0f3203db4.gif",
         "https://cdn.discordapp.com/attachments/892794857905602560/892795432797872188/6619fe492c713eb3051ab7568181dbdd.gif"
         ];
        const Loading = pingImageArr[Math.floor(Math.random() * pingImageArr.length)];
        const Ping = client.ws.ping;
        var Color;
        if (Ping <= 300) {
           Color = "#00ff00";
        } else if(Ping > 300 && Ping < 600) {
           Color = "#ffff00";
        } else if(Ping >= 600 && Ping < 900) {
           Color = "#ffa500";
        } else if(Ping >= 900) {
           Color = "#ff0000";
        };
        const loadingEmbed = new EmbedBuilder()
        .setTitle('🏓 Pong')
        .setDescription('***Đang tải dữ liệu...***')
        .setThumbnail(Loading)
        .setColor('#ffffff');
       const pingEmbed = new EmbedBuilder()
        .setTitle('🏓 Pong')
        .setColor(Color)
        .addFields([
          { name: 'Nhịp websocket', value: `\`\`\`yaml\n${Ping} Ms\`\`\``, inline: true },
          { name: 'Độ trễ khứ hồi', value: `\`\`\`yaml\n${Math.abs(interaction.createdTimestamp - Date.now())} Ms\`\`\``, inline: true },
          { name: 'Độ trễ API', value: `\`\`\`yaml\n${Math.round(client.ws.ping)} Ms\`\`\``, inline: true },
          { name: 'Sử dụng bộ nhớ', value: `\`\`\`yaml\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`\`\``, inline: true },
        ]);
       interaction.reply({ embeds: [loadingEmbed] }).then(() => {
           setTimeout(() => {
               interaction.editReply({ embeds: [pingEmbed] });
           }, 1001);
       });
      } else if(interaction.options.getSubcommand() === "server") {
        let boosts = interaction.guild.premiumSubscriptionCount;
        var boostlevel = 0;
        if (boosts >= 2) boostlevel = "1";
        if (boosts >= 7) boostlevel = "2";
        if (boosts >= 14) boostlevel = "3";
        const Thong_tin_server = new EmbedBuilder()
            .setColor(Options.colors.vang)
            .setAuthor({ name: `Server: ${interaction.guild.name}`, iconURL: client.user.displayAvatarURL() })
            .setDescription(interaction.guild.description || "Không có mô tả")
            .setThumbnail(interaction.guild.iconURL())
            .addFields([
                { name: "> Tên server", value: interaction.guild.name, inline: true },
                { name: "> ID", value: interaction.guild.id, inline: true },
                { name: "> Boost", value: `${boostlevel}[${boosts}]`, inline: true },
                { name: "> Chủ server", value: `${interaction.client.users.cache.get(interaction.guild.ownerId)}`, inline: true },
                { name: "> Thành Viên", value: `Tổng số: ${interaction.guild.memberCount}\nThành viên: ${interaction.guild.members.cache.filter((m) => !m.user.bot).size}\nBot: ${interaction.guild.members.cache.filter((m) => m.user.bot).size}`, inline: true },
                { name: "> Khác", value: `Roles: ${interaction.guild.roles.cache.size}\nEmojis: ${interaction.guild.emojis.cache.size}\n Stickers: ${interaction.guild.stickers.cache.size}`, inline: true },
                { name: "> Kênh", value: `Category: ${interaction.guild.channels.cache.filter((channel) => channel.type == ChannelType.GuildCategory).size}\nText Channel: ${interaction.guild.channels.cache.filter((channel) => channel.type == ChannelType.GuildText).size}\nVoice Channel: ${interaction.guild.channels.cache.filter((channel) => channel.type == ChannelType.GuildVoice).size}\nStage: ${interaction.guild.channels.cache.filter((channel) => channel.type == ChannelType.GuildStageVoice).size}`, inline: true },
                { name: "> Ngày bạn tham gia", value: `<t:${parseInt(interaction.guild.createdAt / 1000)}:F>(<t:${parseInt(interaction.guild.createdAt / 1000)}:R>)`, inline: true }
            ]);
        interaction.reply({ embeds: [Thong_tin_server] });
      };
    } catch (e) {
      console.log(String(e.stack).bgRed);
    };
  },
}