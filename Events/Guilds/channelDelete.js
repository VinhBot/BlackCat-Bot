const { EmbedBuilder } = require("discord.js");
const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);

module.exports = {
	eventName: "channelDelete", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, channel) => {
    return database.findOne({ GuildId: channel.guild.id, GuildName: channel.guild.name }).then(async(getData) => {
      if(!getData) return;
      const channels = channel.guild.channels.cache.find((channel) => {
        return channel.id === getData.channelDelete;
      });
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
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};