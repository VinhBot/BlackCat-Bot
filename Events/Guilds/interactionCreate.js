const { EmbedBuilder, InteractionType, PermissionsBitField } = require("discord.js");
const config = require(`${process.cwd()}/config.json`);
module.exports = {
	eventName: "interactionCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, interaction) => {
    if(interaction.type === InteractionType.ApplicationCommand) {
      if(!client.slashCommands.has(interaction.commandName) || !interaction.guild) return;
      const SlashCommands = client.slashCommands.get(interaction.commandName);
      if(!SlashCommands) return console.log(!SlashCommands);
      if(SlashCommands) {
        try {
          const embed = new EmbedBuilder().setTitle("Thiếu quyền sử dụng lệnh").setColor("Random");
          // dev commands
          if(SlashCommands.owner && config.developer.includes(interaction.user.id)) return interaction.reply({ 
            content: "Tôi, không phải là bot ngu ngốc, chỉ chủ sở hữu mới có thể sử dụng lệnh này"
          });
          // Các quyền của thành viên
          if(SlashCommands.userPerms) {
            if(!interaction.member.permissions.has(PermissionsBitField.resolve(SlashCommands.userPerms || []))) return interaction.reply({               
              embeds: [embed.setDescription(`Xin lỗi, bạn không có quyền ${SlashCommands.userPerms} trong <#${interaction.channelId}> để sử dụng lệnh ${SlashCommands.name} này`)]
            });
          };
          SlashCommands.run(client, interaction);
        } catch(error) {
          if(interaction.replied) return await interaction.editReplyinteraction.editReply({                                                                       
            embeds: [new EmbedBuilder().setDescription("Đã xảy ra lỗi khi thực hiện lệnh, xin lỗi vì sự bất tiện <3")], 
            ephemeral: true,
          }).catch(() => {});
          console.log(error);
        };
      };
    };
  },
};