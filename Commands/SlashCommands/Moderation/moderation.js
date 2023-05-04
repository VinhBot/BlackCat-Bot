const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
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
    }, {
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
      const user = interaction.options.getUser('target');
      const reason = interaction.options.getString("reason");
      const time = interaction.options.getInteger("time");
      const member = await interaction.guild.members.fetch(user.id);
      if(member.roles.highest.position >= interaction.member.roles.highest.position) {
        if(interaction.guild.owner !== interaction.author) return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor("Red")
            .setTitle("Không thể ban thành viên")
            .setDescription(`${user} có role cao hơn bạn.`)
          ], ephemeral: true 
        });
      };
      member.ban({ days: time, reason: reason })
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor("Green")
          .setTitle("Banned")
          .setDescription(`${user} đã bị ban khỏi server`)
          .addFields(
            { name: "Lý do:", value: `${reason}`, inline: true },
            { name: "Thời gian:", value: time, inline: true } 
          )]
      });
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