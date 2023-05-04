const { EmbedBuilder } = require("discord.js");

module.exports = {
	eventName: "channelDelete", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: (client, channel) => {
    let guilds = client.guilds.cache.get("1055150050357022840");
    let channels = guilds.channels.cache.get("1085223809675698260");
    let types = {
        0: 'Text channel',
        2: 'Voice channel'
    };
    const embed = new EmbedBuilder()
    .setTitle("Channel Created")
    .addFields([
      { name: "Tên kênh", value: `${channel.name}`},
      { name: "ID kênh", value: `${channel.id}` },
      { name: "Loại kênh", value: `${types[channel.type]}` },
    ])
    .setColor("Random")
    .setTimestamp()
    channels.send({ embeds: [embed] })
  },
};