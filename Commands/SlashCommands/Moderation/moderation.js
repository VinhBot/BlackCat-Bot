const { ApplicationCommandOptionType, PermissionFlagsBits, PermissionsBitField, EmbedBuilder } = require("discord.js");
module.exports = {
  name: "mod", // Tên lệnh 
  description: "Một số lệnh dành cho Administrator và moderator", // Mô tả lệnh
  userPerms: [PermissionFlagsBits.Administrator], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "ban", 
      description: "Ban thành viên ra khỏi guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "user", 
          description: "Người dùng bạn muốn ban.", 
          type: ApplicationCommandOptionType.User,
          required: true
        },{
          name: "reason", 
          description: "Lý do bạn muốn ban thành viên", 
          type: ApplicationCommandOptionType.String,
          required: true
        },{
          name: "time", 
          description: "Người dùng nên bị ban trong bao lâu.", 
          type: ApplicationCommandOptionType.Integer,
          required: true
        }
      ],
    },{ 
      name: "kick", 
      description: "kick thành viên ra khỏi guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "user", 
          description: "Người dùng bạn muốn kick.", 
          type: ApplicationCommandOptionType.User,
          required: true
        },{
          name: "reason", 
          description: "Lý do bạn muốn kick thành viên", 
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    },{
      name: "clear_message", 
      description: "Xóa số lượng tin nhắn cụ thể.", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "amount", 
        description: "Số lượng tin nhắn bạn muốn xoá", 
        type: ApplicationCommandOptionType.Number,
        required: true
      }]
    }
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "ban") {
      const banUser = interaction.options.getUser('user');
      const time = interaction.options.getInteger("time");
      let reason = interaction.options.getString('reason');
      
      const banMember = await interaction.guild.members.fetch(banUser.id);
      const channel = interaction.channel;
      let guild = await interaction.guild.fetch();
 
      if(!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: "Bạn phải có quyền **Ban Member** để sử dụng lệnh này.", ephemeral: true });
      if(!banMember) return await interaction.reply({ content: 'Người dùng được đề cập không còn trong guilds', ephemeral: true });
      if(banMember.roles.highest.position >= interaction.member.roles.highest.position) {
        if(interaction.guild.owner !== interaction.author) return interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Red")
            .setTitle("Không thể ban thành viên")
            .setDescription(`${user} có role cao hơn bạn.`)
          ], ephemeral: true 
        });
      };
      if(interaction.member.id === banMember.id) return interaction.reply({ content: "Bạn không thể đá chính mình!", ephemeral: true });
      if(banMember.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "Bạn không thể đá nhân viên hoặc những người có quyền Quản trị viên!", ephemeral: true });
      if(!reason) reason = "không có lý do được đưa ra";
 
      return await banMember.ban({ days: time, reason: reason }).then(async() => {
        return await banMember.send({ 
          embeds: [new EmbedBuilder().setColor(0x0099FF).setTitle('Thông báo kiểm duyệt').setDescription(` \n ${banUser.tag}, \n \`Bạn đã bị cấm khỏi ${guild.name}\` \n \n \n **Lý do:** \n ${reason} \n \n **Người điều hành có trách nhiệm:** \n ${interaction.user.tag} | (<@${interaction.user.id}>:${interaction.user.id})`)] 
        }).catch((err) => console.log(err));
      }).then(async() => {
        return await interaction.reply({ embeds: [new EmbedBuilder()
          .setColor("Green")
          .setTitle("Banned")
          .setDescription(`${user} đã bị cấm khỏi server`)
          .addFields(
            { name: "Lý do:", value: `${reason}`, inline: true },
            { name: "Thời gian:", value: time, inline: true } 
          )]
        });
      }).catch((err) => interaction.reply({ content: "Có một lỗi", ephemeral: true }));
    } else if(interaction.options.getSubcommand() === "kick") {
      const kickUser = interaction.options.getUser('user');
      const kickMember = await interaction.guild.members.fetch(kickUser.id);
      const channel = interaction.channel;
      let guild = await interaction.guild.fetch();
 
      if(!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: "Bạn phải có quyền **Kick Member** để sử dụng lệnh này.", ephemeral: true });
      if(!kickMember) return await interaction.reply({ content: 'Người dùng được đề cập không còn trong guilds', ephemeral: true });
      if(!kickMember.kickable) return await interaction.reply({ content: "Tôi không thể đá người dùng này vì họ cao hơn tôi hoặc bạn.", ephemeral: true });
      if(interaction.member.id === kickMember.id) return interaction.reply({ content: "Bạn không thể đá chính mình!", ephemeral: true });
      if(kickMember.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "Bạn không thể đá nhân viên hoặc những người có quyền Quản trị viên!", ephemeral: true });
 
      let reason = interaction.options.getString('reason');
      if(!reason) reason = "không có lý do được đưa ra";
 
      const dmEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Thông báo kiểm duyệt')
      .setDescription(` \n ${kickUser.tag}, \n \`Bạn đã bị đuổi khỏi ${guild.name}\` \n \n \n **Lý do:** \n ${reason} \n \n **Người điều hành có trách nhiệm:** \n ${interaction.user.tag} | (<@${interaction.user.id}>:${interaction.user.id})`)
 
      const embed = new EmbedBuilder().setColor("#2f3136").setDescription(`:white_check_mark: ${kickUser.tag} đã bị đuổi khỏi **${interaction.guild.name} | ${reason}**`).setTimestamp()
 
      await kickMember.send({ embeds: [dmEmbed] }).catch((err) => {
        return console.log(err);
      });
 
      await kickMember.kick({ reason: reason }).catch((err) => {
        return interaction.reply({ content: "Có một lỗi", ephemeral: true });
      });
 
      await interaction.reply({ embeds: [embed] });
    } else if(interaction.options.getSubcommand() === "clear_message") {
      const amount = interaction.options.getNumber("amount");   
      if(amount < 1 || amount > 99) return await interaction.reply({ 
        embeds: [new EmbedBuilder()
          .setTitle("Lỗi")
          .setDescription("Bạn chỉ có thể xóa từ 1 đến 99 tin nhắn.")
          .setColor("Red")
        ]
      });
      await interaction.channel.bulkDelete(amount, true).then(async() => {
        return interaction.channel.send({
          embeds: [new EmbedBuilder()
            .setTitle("Xoá thành công")
            .setDescription(`Đã xóa thành công ${amount} tin nhắn.`)
            .setColor("Random")
          ]
        });
      });
    }
  },
};