const { EmbedBuilder } = require("discord.js");

module.exports = {
	eventName: "voiceStateUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: (client, oldState, newState) => {
    try {
    const data = {
      ChannelID: "1085223809675698260"
    };
    if(!data) return;
    let guilds = client.guilds.cache.get("1055150050357022840");
    let channels = guilds.channels.cache.get(data.ChannelID);
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
    } catch(e) {
      console.log(e)
    }
  },
};