const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { setupDatabase } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
module.exports = async(guild) => {
  // tạo database cho guil khi gia nhập
  await setupDatabase(guild);
  // Tin nhắn gửi đến channel mà bot có thể gửi. :)) 
  const inviteBot = new ButtonBuilder().setCustomId('inviteBot').setLabel('Mời bot').setStyle("Primary").setEmoji('🗿');
  const Discord = new ButtonBuilder().setCustomId('inviteDiscord').setLabel('Vào Discord').setStyle("Primary").setEmoji('🏡');
  guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText).send({ 
    embeds: [new EmbedBuilder()
      .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }), url: "https://discord.gg/tSTY36dPWa" })
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor("Random")
      .setTimestamp()
      .setDescription(`✨ ${config.prefix}help để xem tất cả các lệnh`)
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
    ], components: [new ActionRowBuilder().addComponents([ inviteBot, Discord ])]
  }).catch((e) => console.log(`guildCreate: ${e}`));
};