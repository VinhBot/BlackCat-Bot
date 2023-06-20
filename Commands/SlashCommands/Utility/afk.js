const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { afkSchema } = require(`${process.cwd()}/Assets/Schemas/database`);

module.exports = {
  name: "afk", // Tên lệnh 
  description: "thiết lập trạng thái afk", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "set", 
      description: "thiết lập afk cho bạn", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "reason", 
        description: "Lý do afk", 
        type: ApplicationCommandOptionType.String,
        required: true
      }],
    },{ 
      name: "remove", 
      description: "hủy trạng thái afk", 
      type: ApplicationCommandOptionType.Subcommand
    },
  ],
  run: async(client, interaction) => {
    const Data = await afkSchema.findOne({ GuildId: interaction.guild.id, UserId: interaction.user.id });
  
    if(interaction.options.getSubcommand() === "set") {
      if(Data) {
        return await interaction.reply({ content: `Bạn **đã** AFK trong máy chủ này!`, ephemeral: true });
      } else {
        const reason = interaction.options.getString('reason') || 'không có lý do đưa ra!';
        const nickname = interaction.member.nickname || interaction.user.username;

        await afkSchema.create({
          GuildId: interaction.guild.id,
          UserId: interaction.user.id,
          Message: reason,
          Nickname: nickname
        });
 
        const name = `[AFK] ${nickname}`
        await interaction.member.setNickname(`${name}`).catch(err => {
          return console.log(err);
        });
 
        return interaction.channel.send({ content: `Bạn hiện đang **AFK**! \n Thực hiện **/afk remove** hoặc nhập nội dung nào đó vào cuộc trò chuyện để hoàn tác.`, ephemeral: true }).then(() => {
          return interaction.channel.send({
            embeds: [new EmbedBuilder()
              .setColor('#2f3136')
              .setTitle(`${interaction.user.username} đã được AFK`)
              .setDescription(`**Lý do**: ${reason}`)
              .setFooter({ text: `🌙 Bạn đã và đang afk` })              
              .setTimestamp()
            ]
          });
        });
      };
    } else if(interaction.options.getSubcommand() === "remove") {
      if(!Data) {
        return await interaction.reply({ content: `Bạn **không** AFK, không thể xóa...`, ephemeral: true});
      } else {
        const nick = Data.Nickname;
        await afkSchema.deleteMany({ GuildId: interaction.guild.id, UserId: interaction.user.id });
 
        await interaction.member.setNickname(`${nick}`).catch((err) => {
          return console.log(err);
        });
 
        const embed1 = new EmbedBuilder()
        .setColor('#2f3136')
        .setTitle(`${interaction.user.username} đã trở lại từ AFK`)
        .setDescription(`${interaction.user.username} đã trở lại, nói xin chào 👋`)
        .setFooter({ text: `🌙 Có người đã trở về`})
        .setTimestamp()
 
        await interaction.reply({ content: `Bạn **không còn** AFK! Chào mừng trở lại :)`, ephemeral: true });
        interaction.channel.send({ embeds: [embed1] });
      };
    };
  },
};