const { AttachmentBuilder, EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const config  = require(`${process.cwd()}/config.json`);

module.exports = (client) => {
  /*========================================================
  ========================================================*/
  client.on("messageCreate", async(message) => {
    if(message.content === "ticket") {
      const ChannelId = "1091778868442050632";
    };
  });
};