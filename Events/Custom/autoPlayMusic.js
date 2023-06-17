const { Music: database } = require(`${process.cwd()}/Assets/Schemas/database`);

module.exports = {
	eventName: "messageCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, message) => {
    return database.findOne({ GuildId: message.guild?.id, GuildName: message.guild?.name }).then(async(data) => {
      if(!data) return;
      if(!message.guild || !message.guild.available) return;
      if(!data.ChannelId || data.ChannelId.length < 5) return;
      let textChannel = message.guild.channels.cache.get(data.ChannelId) || await message.guild.channels.fetch(data.ChannelId).catch(() => {}) || false;
      if(!textChannel) return console.log("Không có channel nào được thiết lập");
      if(textChannel.id != message.channel.id) return;
      // xoá tin nhắn 
      if (message.author.id === client.user.id) {
        setTimeout(() => {
          if(!message.deleted) {
            message.delete().catch(() => {});
          };
        }, 3000);
      } else {
        if(!message.deleted) {
          message.delete().catch((e) => {});
        };
      };
      if(message.author.bot) return;
      // kiểm tra xem thành viên có ở trong voice hay không
      if(!await message.member.voice.channel) return message.channel.send({ 
        content: "Bạn cần phải ở trong một kênh voice"
      });
      // yêu cầu phát nhạc
      await client.distube.play(message.member.voice.channel, message.cleanContent, {
        member: message.member,
        textChannel: message.channel,
        message,
      });
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};