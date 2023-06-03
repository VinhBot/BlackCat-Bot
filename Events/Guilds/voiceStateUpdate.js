const { ChannelType, Collection, EmbedBuilder } = require("discord.js");
const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);

module.exports = {
	eventName: "voiceStateUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, oldState, newState) => {
    return database.findOne({ GuildId: oldState.guild.id, GuildName: oldState.guild.name }).then(async(getData) => {
      if(!getData) return;
      const channels = oldState.guild.channels.cache.find((channel) => {
        return channel.id === getData.channelDelete;
      });
      if(!channels) return;
      let oldUser = oldState.member;
      let newUser = newState.member;
      if(oldUser.voice.channelId !== newUser.voice.channelId && newUser.voice.channelId !==  null || undefined) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã tham gia kênh voice <#${newUser.voice.channelId}>`)
            .setColor("Yellow")
            .setTimestamp()
          ] 
        }).catch((ex) => console.log(ex));
      } else if(oldUser.voice.channelId !== newUser.voice.channelId && newUser.voice.channelId ===  null || undefined) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} rời khỏi kênh voice <#${oldUser.voice.channelId}>`)
            .setColor("Yellow")
            .setTimestamp()
          ]
        }).catch((ex) => console.log(ex));
      } else if(oldState.mute !== newState.mute) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã ${newState.mute ? "tắt tiếng" : "bật tiếng"}`)
            .setColor("Yellow")
            .setTimestamp()
          ] 
        }).catch((ex) => console.log(ex));
      } else if(oldState.deaf !== newState.deaf) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã ${newState.deaf ? "tắt âm thanh" : "bật âm thanh"}`)
            .setColor("Yellow")
            .setTimestamp()
          ] 
        }).catch((ex) => console.log(ex));
      };
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};