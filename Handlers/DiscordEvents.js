const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const { setupDatabase, ticketHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});

module.exports = async(client) => {
  /*========================================================
  # interactionCreate.js
  ========================================================*/
  client.on("interactionCreate", async(interaction) => {
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
      // help
    };
  });
  /*========================================================
  # guildCreate.js 👻
  ========================================================*/
  client.on("guildCreate", async(guild) => {
    // tạo database cho guil khi gia nhập
    await setupDatabase(guild);
    // Tin nhắn gửi đến channel mà bot có thể gửi. :)) 
    const inviteBot = new ButtonBuilder().setCustomId('inviteBot').setLabel('Mời bot').setStyle("Primary").setEmoji('🗿');
    const Discord = new ButtonBuilder().setCustomId('inviteDiscord').setLabel('Vào Discord').setStyle("Primary").setEmoji('🏡');
    guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText).send({ 
      embeds: [new EmbedBuilder()
        .setAuthor({ name: guild.name, url: "https://discord.gg/tSTY36dPWa" })
        .setThumbnail("https://i.pinimg.com/originals/3f/2c/10/3f2c1007b4c8d3de7d4ea81b61008ca1.gif")
        .setColor("Random")
        .setTimestamp()
        .setDescription(`✨ ${config.prefix}help để xem tất cả các lệnh`)
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      ], components: [new ActionRowBuilder().addComponents([ inviteBot, Discord ])]
    }).catch((e) => console.log(`guildCreate: ${e}`));
  });
  /*========================================================
  # guildDelete.js ☠️
  ========================================================*/
  client.on("guildDelete", async(guild) => {
    // xoá database khi bot rời khỏi guilds
    await database.delete(guild.id);
  });
  /*========================================================
  # 
  ========================================================*/
};