const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});
module.exports = {
	eventName: "channelDelete", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, channel) => {
    const getData = await database.get(channel.guild.id);
    if(!getData) return;
    let guilds = client.guilds.cache.get(getData.defaultGuildId);
    let channels = guilds.channels.cache.get(getData.setDiaryChannel.channelDelete);
    if(!channels) return;
    let types = {
      0: "Text Channel",
      2: "Voice Channel",
      4: "Category",
      5: "News Channel",
      10: "News Thread",
      11: "Public Thread",
      12: "Private Thread",
      13: "Stage Channel",
      14: "Category",
    };
    return channels.send({
      embeds: [new EmbedBuilder()
        .setTitle("Channel Delete")
        .addFields([
          { name: "Tên kênh", value: `${channel.name}`},
          { name: "ID kênh", value: `${channel.id}` },
          { name: "Danh mục", value: `- ${channel.parent}` },
          { name: "Loại kênh", value: `${types[channel.type]}` },
        ])
        .setColor("Random")
        .setTimestamp()
      ] 
    });
  },
};