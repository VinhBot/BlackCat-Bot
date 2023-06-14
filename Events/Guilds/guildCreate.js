const { EmbedBuilder, ChannelType, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);
const config = require(`${process.cwd()}/config.json`);

module.exports = {
	eventName: "guildCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, guild) => {
    // Tin nhắn gửi đến channel mà bot có thể gửi. :)) 
    guild.channels.cache.find((channel) => { 
      return channel.type === ChannelType.GuildText;
    }).send({ embeds: [new EmbedBuilder()
        .setAuthor({ name: guild.name, url: "https://discord.gg/tSTY36dPWa" })
        .setThumbnail("https://i.pinimg.com/originals/3f/2c/10/3f2c1007b4c8d3de7d4ea81b61008ca1.gif")
        .setColor("Random")
        .setTimestamp()
        .setDescription(`✨ ${config.prefix}help để xem tất cả các lệnh`)
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
    ], components: [new ActionRowBuilder().addComponents([ 
        new ButtonBuilder().setCustomId('inviteBot').setLabel('Mời bot').setStyle("Primary").setEmoji('🗿'),
        new ButtonBuilder().setCustomId('inviteDiscord').setLabel('Vào Discord').setStyle("Primary").setEmoji('🏡') 
    ])]}).catch((e) => console.log(`guildCreate: ${e}`));
    // gởi tin nhắn vào kênh nhật ký
    database.findOne({ GuildId: guild.id, GuildName: guild.name }).then(async(getData) => {
      if(!getData) return;
      const channels = guild.channels.cache.find((channel) => {
        return channel.id === getData.guildCreate;
      });
      if(!channels) return;
      let invite = await guild.channels.cache.filter((x) => {
        return x.type === ChannelType.GuildText;
      }).random(1)[0].createInvite({
        maxAge: 0, 
        maxUses: 5
      });
      let owner = await guild.fetchOwner();
      // Gửi tin nhắn vào chanel
      return channels.send({
        embeds: [new EmbedBuilder()
          .setAuthor({ name: guild.name, iconURL: owner.user.displayAvatarURL({ dynamic: true }) })
          .setDescription(`Tôi đã thêm vào \`${guild.name}\` và tổng số guild của tôi là: \`${client.guilds.cache.size}\``)
          .addFields([
            { name: `👑| Tên chủ sở hữu: `, value: `\`${owner.user.tag}\``, inline: true },
            { name: `👓| ID chủ sở hữu: `, value: `\`${owner.user.id}\``, inline: true },
            { name: `👥| Tổng số thành viên:`, value: `\`${guild.members.cache.size}\``, inline: true },
            { name: `📬| Link tham gia: `, value: `**${invite? `${invite.url}` : "không tạo được :("}**`, inline: true },
            { name: `🆔| Guild ID:`, value: `**\`${guild.id}\`**`, inline: true },
            { name: `📅| Tạo lúc:`, value: `**<t:${Date.parse(guild.createdAt) / 1000}:D> | <t:${Date.parse(guild.createdAt) / 1000}:R>**`, inline: true }
          ])
          .setColor("Random")
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setFooter({ text: client.user.tag, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp(Date.now())
        ] 
      });
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};