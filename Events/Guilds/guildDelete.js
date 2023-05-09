const { EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});

module.exports = {
	eventName: "guildDelete", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, guild) => {
    const getData = await database.get(guild.id);
    if(!getData) return;
    let guilds = client.guilds.cache.get(getData.defaultGuildId);
    let channels = guilds.channels.cache.get(getData.setDiaryChannel.guildDelete);
    if(!channels) return;
    // lấy owner value
    let owner = await guild.fetchOwner();
    // xoá database khi bot rời khỏi guilds
    await database.delete(guild.id);
    // gửi tin nhắn vào channel
    return channels.send({ 
      embeds: [new EmbedBuilder()
        .setAuthor({ name: guild.name, iconURL: owner.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Tôi đã bị kick khỏi \`${guild.name}\` và tổng số guilds còn lại: \`${client.guilds.cache.size}\``)
        .addFields([
          { name: `👑| Tên chủ sở hữu: `, value: `\`${owner.user.tag}\``, inline: true },
          { name: `👓| ID chủ sở hữu: `, value: `\`${owner.user.id}\``, inline: true },
          { name: `👥| Tổng số thành viên:`, value: `\`${guild.members.cache.size}\``, inline: true },
          { name: `🆔| Guild ID:`, value: `**\`${guild.id}\`**`, inline: true },
          { name: `📅| tạo lúc:`, value: `**<t:${Date.parse(guild.createdAt) / 1000}:D> | <t:${Date.parse(guild.createdAt) / 1000}:R>**`, inline: true }
        ])
        .setColor("Random")
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp(Date.now())
        .setFooter({ text: client.user.tag, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      ]
    });
  },
};