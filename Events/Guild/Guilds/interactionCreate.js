const { EmbedBuilder, PermissionsBitField, PermissionFlagsBits, InteractionType, CommandInteraction, Collection, Client, ModalSubmitInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require("discord.js");
const { onCoolDown, /* endGiveaway, handleTicketOpen, handleTicketClose*/ } = require(`../../functions`);
const Options = require(`../../Json/database.json`);
const ms = require("ms");

module.exports = async(client, interaction) => {
    if(interaction.type === InteractionType.ApplicationCommand) {
        if(!client.slashCommands.has(interaction.commandName) || !interaction.guild) return;
        const SlashCommands = client.slashCommands.get(interaction.commandName);
        if(!SlashCommands) return;
        if(SlashCommands) {
          const embed = new EmbedBuilder().setTitle("Thiếu quyền sử dụng lệnh").setColor(Options.colors.vang)
          // trạng thái hồi lệnh
          if (onCoolDown(interaction, SlashCommands)) return interaction.reply({
            embeds: [new EmbedBuilder().setColor("Red").setFooter({ text: "Bạn đang ở trạng thái chờ tái sử dụng lệnh" }).setTitle(`❌ Vui lòng chờ ${onCoolDown(interaction, SlashCommands)} Giây trước khi sử dụng lại lệnh: \`${interaction.commandName}\`.`).setTimestamp()], 
            ephemeral: true,
          });
          // dev commands
          if (SlashCommands.owner && "413192599663280138".includes(interaction.user.id)) return interaction.reply({ 
            content: `Tôi, không phải là bot ngu ngốc, chỉ chủ sở hữu mới có thể sử dụng lệnh này`
          });
          // Các quyền của thành viên
          if (SlashCommands.userPerms) {
            if(!interaction.member.permissions.has(PermissionsBitField.resolve(SlashCommands.userPerms || []))) return interaction.reply({ 
              embeds: [embed.setDescription(`Xin lỗi, bạn không có quyền \`${SlashCommands.userPerms}\` trong <#${interaction.channelId}> để sử dụng lệnh \`${SlashCommands.name}\` này`)]
            });
          };           
          // Đầu ra những lệnh đã được sử dụng
        console.log(`${SlashCommands.name} được sử dụng bởi ${interaction.user.tag} từ ${interaction.guild.name} (${interaction.guild.id})`);
        try {
            SlashCommands.run(client, interaction, Options);
        } catch(error) {
          if(interaction.replied) {
            return await interaction.editReplyinteraction.editReply({ 
              embeds: [new EmbedBuilder().setDescription("Đã xảy ra lỗi khi thực hiện lệnh, xin lỗi vì sự bất tiện \`<3\`")], 
              ephemeral: true,
            }).catch(() => {});
          } else return await interaction.followUp({
              embeds: [new EmbedBuilder().setDescription("Đã xảy ra lỗi khi thực hiện lệnh, xin lỗi vì sự bất tiện \`<3\`")], 
              ephemeral: true 
          }).catch(() => {});
          console.log(error);
        };
     };
   } 
   /*
    else if(interaction.isButton()) {
     switch (interaction.customId) {
       // ticket
       case "TICKET_CREATE": {
         return handleTicketOpen(interaction);
       }
       case "TICKET_CLOSE": {
         return handleTicketClose(interaction);
       }
       // 
    };
  };
  */
};