const { EmbedBuilder } = require('discord.js')

module.exports = {
	eventName: "guildBanAdd", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, member) => {
    const data = {
      ChannelID: "1085223809675698260"
    };
    if(!data) return;
    return member.guild.channels.cache.get(data.ChannelID).send({
      embeds: [new EmbedBuilder()
        .setTitle('Member Banned')
        .setDescription(`Thành viên: ${member.user.tag} (${member.user})\nID thành viên: ${member.id}\nAcc được tạo vào: ${member.user.createdAt}`)
        .setColor("Red")
        .setTimestamp()
      ]
    });
  },
};