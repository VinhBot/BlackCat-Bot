const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const config = require(`${process.cwd()}/config.json`);

module.exports = {
	eventName: "interactionCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, interaction) => {
    if(interaction.isButton()) {
      if(interaction.customId === "inviteBot") {
        interaction.reply({ content: `[Bấm vào đây](${config.discordBot})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      } else if(interaction.customId === "inviteDiscord") {
        interaction.reply({ content: `[Bấm vào đây](${config.discord})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      };
    };
  },
};