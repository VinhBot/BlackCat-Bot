const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});
module.exports = {
	eventName: "channelCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, channel) => {
    const getData = await database.get(channel.guild.id);
    if(!getData) return;
    let guilds = client.guilds.cache.get(getData.defaultGuildId);
    let channels = guilds.channels.cache.get(getData.setDiaryChannel.channelCreate);
    if(!channels) return;
    let types = {
        0: 'Text channel',
        2: 'Voice channel'
    };
    return channels.send({ 
      embeds: [new EmbedBuilder()
        .setTitle("Channel Created")
        .addFields([
          { name: "Tên kênh", value: `${channel.name}`},
          { name: "ID kênh", value: `${channel.id}` },
          { name: "Loại kênh", value: `${types[channel.type]}` },
        ])
        .setColor("Random")
        .setTimestamp()
      ] 
    });
  },
};