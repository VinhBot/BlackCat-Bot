const { EmbedBuilder } = require('discord.js');
module.exports = async(client, guild) => {
    let Sguild = client.guilds.cache.get("1055150050357022840");
    let channel = Sguild.channels.cache.get("1085223809675698260");
    let owner = await guild.fetchOwner();
    let embed = new EmbedBuilder()
     .setAuthor({
        name: guild.name,
        iconURL: owner.user.displayAvatarURL({ dynamic: true })
     })
     .setDescription(`Tôi đã bị kick khỏi \`${guild.name}\` và tổng số guilds còn lại: \`${client.guilds.cache.size}\``)
     .addFields([
       {
         name: `👑| Tên chủ sở hữu: `,
         value: `\`${owner.user.tag}\``,
         inline: true
       },{
         name: `👓| ID chủ sở hữu: `,
         value: `\`${owner.user.id}\``,
         inline: true
       },{
         name: `👥| Tổng số thành viên:`, 
         value: `\`${guild.members.cache.size}\``, 
         inline: true
       },{
         name: `🆔| Guild ID:`, 
         value: `**\`${guild.id}\`**`, 
         inline: true
       },{
         name: `📅| tạo lúc:`, 
         value: `**<t:${Date.parse(guild.createdAt) / 1000}:D> | <t:${Date.parse(guild.createdAt) / 1000}:R>**`, 
         inline: true
       }
     ])
     .setColor("Random")
     .setThumbnail(guild.iconURL({ dynamic: true }))
     .setFooter({ 
       text: client.user.tag, 
       iconURL: client.user.displayAvatarURL({ dynamic: true })
     })
     .setTimestamp(Date.now())
    channel.send({ embeds: [embed] });
};