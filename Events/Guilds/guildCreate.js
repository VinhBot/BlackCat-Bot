const { ChannelType, EmbedBuilder } = require("discord.js");
const { setupDatabase } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
module.exports = async(guild) => {
  // tạo database cho guil khi gia nhập
  await setupDatabase(guild);
  // Tin nhắn gửi đến channel mà bot có thể gửi. :)) 
  guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText).send({ 
    embeds: [new EmbedBuilder()
      .setAuthor({ name: client.user.username })
      .setDescription(config.prefix + 'help để xem tất cả các lệnh')
      .setColor('Blue')
    ]
  }).catch((e) => console.log(`guildCreate: ${e}`));
};