const { EmbedBuilder } = require("discord.js");
    
module.exports = {
	eventName: "channelCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: (client, channel) => {
    const embed = new EmbedBuilder()
    .setTitle("Channel Created")
    .setDescription(`Tên kênh: ${channel.name}\nID kênh: ${channel.id}\nLoại kênh: ${channel.type}`)
    .setColor("Green")
    .setTimestamp()
    channel.guild.channels.cache.get("1085223809675698260").send({ embeds: [embed] })
  },
};