const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType } = require("discord.js");

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
      name: "userinfo",
      description: "xem thông tin của thành viên trong guilds",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "user",
          description: "Bạn muốn xem thông tin của ai nào?",
          type: ApplicationCommandOptionType.User,
          required: true,
      }],
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
  },{
      name: "permissions",
      description: "Xem các quyền hạn của bạn hoặc của thành viên",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "user",
          description: "Bạn muốn nhận thông tin từ ai nào?",
          type: ApplicationCommandOptionType.User,
          required: true,
      }],
  }],
  run: async(client, interaction) => {
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
        return interaction.reply({ 
          ephemeral: true,
          embeds: [new EmbedBuilder()
            .setColor("Random")
            .setFooter({ text: client.user.username, iconURL: interaction.member.guild.iconURL({ dynamic: true }) })
            .setDescription(`[Bấm vào đây để mời tôi!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)\n\n||[Nhấp vào đây để mời tôi mà không có Lệnh Slash!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)||`)]
        });
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
          setTimeout(() => interaction.editReply({ embeds: [pingEmbed] }), 1001);
       });
      } else if(interaction.options.getSubcommand() === "server") {
        let boosts = interaction.guild.premiumSubscriptionCount;
        var boostlevel = 0;
        if(boosts >= 2) boostlevel = "1";
        if(boosts >= 7) boostlevel = "2";
        if(boosts >= 14) boostlevel = "3";
        const Thong_tin_server = new EmbedBuilder()
            .setColor("Random")
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
      } else if(interaction.options.getSubcommand() === "userinfo") {
        const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id);
        if(!member) return interaction.reply({ content: "Người dùng này không ở trong guilds" });
        const badgeFlags = {
          DEVELOPER: "👨‍💻",
          BUGS: "🐛",
          MANAGEMENT: "👑",
          PREMIUM: "👑",
          SUPPORTER: "👨‍🔧",
          TEAM: "👨‍👩‍👧‍👦",
          BOOSTER: "🚀",
          PARTNER: "🤝",
          VOTER: "🗳️",
          SUPPORT: "🔧",
          MODERATOR: "👮‍♂️",
          DESIGNER: "🎨",
          MARKETING: "📈"
        };
        const flags = {
          ActiveDeveloper: "👨‍💻・Active Developer",
          BugHunterLevel1: "🐛・Discord Bug Hunter",
          BugHunterLevel2: "🐛・Discord Bug Hunter",
          CertifiedModerator: "👮‍♂️・Certified Moderator",
          HypeSquadOnlineHouse1: "🏠・House Bravery Member",
          HypeSquadOnlineHouse2: "🏠・House Brilliance Member",
          HypeSquadOnlineHouse3: "🏠・House Balance Member",
          HypeSquadEvents: "🏠・HypeSquad Events",
          PremiumEarlySupporter: "👑・Early Supporter",
          Partner: "👑・Partner",
          Quarantined: "🔒・Quarantined", // Không chắc chắn cái này còn hoạt động :))
          Spammer: "🔒・Spammer", // Không chắc chắn cái này còn hoạt động :)
          Staff: "👨‍💼・Discord Staff",
          TeamPseudoUser: "👨‍💼・Discord Team",
          VerifiedBot: "🤖・Verified Bot",
          VerifiedDeveloper: "👨‍💻・(early)Verified Bot Developer",
        };
        const roles = member.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString()).slice(0, -1);
        const userFlags = member.user.flags ? member.user.flags.toArray() : [];
        return interaction.reply({ embeds: [new EmbedBuilder()
           .setTitle("Xem thông tin người dùng")
           .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
           .setDescription(`Thông tin về ${member.user.username}`)
           .setImage(member.user.bannerURL({ dynamic: true, size: 1024 }))
           .addFields([
             { name: "tên thành viên", value: `${member.user.username}`, inline: true },
             { name: "Số định danh", value: `${member.user.discriminator}`, inline: true },
             { name: "Biệt danh", value: `${member.nickname || 'không có biệt danh'}`, inline: true },
             { name: "Id", value: `${member.user.id}`, inline: true },
             { name: "Huy hiệu của thành viên", value: `${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Không có'}`, inline: true },
             { name: "Ngày tham gia discord", value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true },
             { name: "Ngày tham gia server", value: `<t:${Math.round(member.joinedAt / 1000)}>`, inline: true },
             { name: `Roles [${roles.length}]`, value: `${roles.length ? roles.join(', ') : 'Không có'}`, inline: false }
           ])                     
        ]});
      } else if(interaction.options.getSubcommand() === "permissions") {
        const Member = interaction.options.getMember("user")
        const USER = interaction.options.getUser("user")

        let Embed = new EmbedBuilder().setColor("DarkRed");
        if(!Member) return interaction.reply({
            embeds: [Embed.setDescription("Thành viên không thể được tìm thấy")], ephemeral: true
        });
        return interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`🛠 | Permissions`)
            .setDescription(`Permissions của ${Member}\`\`\`CreateInstantInvite ${Member.permissions.has([PermissionFlagsBits.CreateInstantInvite]) ? "✅" : "❌"}\
            \nKickMembers ${Member.permissions.has([PermissionFlagsBits.KickMembers]) ? "✅" : "❌"}\
            \nBanMember ${Member.permissions.has([PermissionFlagsBits.BanMembers]) ? "✅" : "❌"}\
            \nAdministrator ${Member.permissions.has([PermissionFlagsBits.Administrator]) ? "✅" : "❌"}\
            \nManageChannels ${Member.permissions.has([PermissionFlagsBits.ManageChannels]) ? "✅" : "❌"}\
            \nManageGuild ${Member.permissions.has([PermissionFlagsBits.ManageGuild]) ? "✅" : "❌"}\
            \nAddReactions ${Member.permissions.has([PermissionFlagsBits.AddReactions]) ? "✅" : "❌"}\
            \nViewAuditLog ${Member.permissions.has([PermissionFlagsBits.ViewAuditLog]) ? "✅" : "❌"}\
            \nPrioritySpeaker ${Member.permissions.has([PermissionFlagsBits.PrioritySpeaker]) ? "✅" : "❌"}\
            \nStream ${Member.permissions.has([PermissionFlagsBits.Stream]) ? "✅" : "❌"}\
            \nViewChannel ${Member.permissions.has([PermissionFlagsBits.ViewChannel]) ? "✅" : "❌"}\
            \nSendMessages ${Member.permissions.has([PermissionFlagsBits.SendMessages]) ? "✅" : "❌"}\
            \nSendTTSMessages ${Member.permissions.has([PermissionFlagsBits.SendTTSMessages]) ? "✅" : "❌"}\
            \nManageMessages ${Member.permissions.has([PermissionFlagsBits.ManageMessages]) ? "✅" : "❌"}\
            \nEmbedLinks ${Member.permissions.has([PermissionFlagsBits.EmbedLinks]) ? "✅" : "❌"}\
            \nAttachFiles ${Member.permissions.has([PermissionFlagsBits.AttachFiles]) ? "✅" : "❌"}\
            \nReadMessageHistory ${Member.permissions.has([PermissionFlagsBits.ReadMessageHistory]) ? "✅" : "❌"}\
            \nMentionEveryone ${Member.permissions.has([PermissionFlagsBits.MentionEveryone]) ? "✅" : "❌"}\
            \nUseExternalEmojis ${Member.permissions.has([PermissionFlagsBits.UseExternalEmojis]) ? "✅" : "❌"}\
            \nViewGuildInsights ${Member.permissions.has([PermissionFlagsBits.ViewGuildInsights]) ? "✅" : "❌"}\
            \nConnect ${Member.permissions.has([PermissionFlagsBits.Connect]) ? "✅" : "❌"}\
            \nSpeak ${Member.permissions.has([PermissionFlagsBits.Speak]) ? "✅" : "❌"}\
            \nMuteMembers ${Member.permissions.has([PermissionFlagsBits.MuteMembers]) ? "✅" : "❌"}\
            \nDeafenMembers ${Member.permissions.has([PermissionFlagsBits.DeafenMembers]) ? "✅" : "❌"}\
            \nMoveMembers ${Member.permissions.has([PermissionFlagsBits.MoveMembers]) ? "✅" : "❌"}\
            \nUseVAD ${Member.permissions.has([PermissionFlagsBits.UseVAD]) ? "✅" : "❌"}\
            \nChangeNickname ${Member.permissions.has([PermissionFlagsBits.ChangeNickname]) ? "✅" : "❌"}\
            \nManageNicknames ${Member.permissions.has([PermissionFlagsBits.ManageNicknames]) ? "✅" : "❌"}\
            \nManageRoles ${Member.permissions.has([PermissionFlagsBits.ManageRoles]) ? "✅" : "❌"}\
            \nManageWebhooks ${Member.permissions.has([PermissionFlagsBits.ManageWebhooks]) ? "✅" : "❌"}\
            \nManageEmojisAndStickers ${Member.permissions.has([PermissionFlagsBits.ManageEmojisAndStickers]) ? "✅" : "❌"}\
            \nUseApplicationCommands ${Member.permissions.has([PermissionFlagsBits.UseApplicationCommands]) ? "✅" : "❌"}\
            \nRequestToSpeak ${Member.permissions.has([PermissionFlagsBits.RequestToSpeak]) ? "✅" : "❌"}\
            \nManageEvents ${Member.permissions.has([PermissionFlagsBits.ManageEvents]) ? "✅" : "❌"}\
            \nManageThreads ${Member.permissions.has([PermissionFlagsBits.ManageThreads]) ? "✅" : "❌"}\
            \nCreatePublicThreads ${Member.permissions.has([PermissionFlagsBits.CreatePublicThreads]) ? "✅" : "❌"}\
            \nCreatePrivateThreads ${Member.permissions.has([PermissionFlagsBits.CreatePrivateThreads]) ? "✅" : "❌"}\
            \nUseExternalStickers ${Member.permissions.has([PermissionFlagsBits.UseExternalStickers]) ? "✅" : "❌"}\
            \nSendMessagesInThreads ${Member.permissions.has([PermissionFlagsBits.SendMessagesInThreads]) ? "✅" : "❌"}\
            \nUseEmbeddedActivities ${Member.permissions.has([PermissionFlagsBits.UseEmbeddedActivities]) ? "✅" : "❌"}\
            \nModerateMembers ${Member.permissions.has([PermissionFlagsBits.ModerateMembers]) ? "✅" : "❌"}\
            \n\`\`\``)
            .setFooter({ text: `${USER.tag}`, iconURL: Member.displayAvatarURL() })
            .setTimestamp()],
        });
      };
    } catch (e) {
      console.log(String(e.stack).bgRed);
    };
  },
}