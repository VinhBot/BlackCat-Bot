const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const { ticketHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);

module.exports = {
	eventName: "interactionCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, interaction) => {
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
      const { handleTicketOpen, handleTicketClose } = new ticketHandler();
      if(customId === "TicketCreate") {
        return handleTicketOpen(interaction);
      } else if(customId === "TicketClose") {
        return handleTicketClose(interaction);
      };
      /*========================================================
      # 
      ========================================================*/
    } else if(interaction.isStringSelectMenu()) {
      //// 
    };
  },
};