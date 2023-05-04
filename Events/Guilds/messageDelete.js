const { EmbedBuilder } = require("discord.js");
module.exports = {
	eventName: "messageDelete", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, message) => {
    const data = {
      ChannelID: "1085223809675698260"
    };
    if (!data) return;
    return message.guild.channels.cache.get(data.ChannelID).send({ 
      embeds: [new EmbedBuilder()
        .setTitle("Message Deleted")
        .setDescription(`${message.author.username} đã xoá tin nhắn trong ${message.channel}`)
        .addFields({ name: 'Nội dung tin nhắn', value: `${message.content}` })
        .setColor("Yellow")
        .setTimestamp()
      ]
    });
  },
};