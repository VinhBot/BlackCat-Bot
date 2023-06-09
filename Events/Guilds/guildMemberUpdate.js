const { EmbedBuilder } = require('discord.js')
const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);

module.exports = {
	eventName: "guildMemberUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, oldMember, newMember) => {
    return database.findOne({ GuildId: oldMember.guild.id, GuildName: oldMember.guild.name }).then(async(getData) => {
      if(!getData) return;
      const channels = oldMember.guild.channels.cache.find((channel) => {
        return channel.id === getData.guildMemberUpdate;
      });
      if(!channels) return;
      if(newMember.nickname !== oldMember.nickname) {
        let oldNickname = oldMember.nickname ? oldMember.nickname : oldMember.user.username;
        let newNickname = newMember.nickname ? newMember.nickname : newMember.user.username;
        return channels.send({
          embeds: [new EmbedBuilder()
           .setTitle(`${newMember.user.tag}`)
           .addFields({ name: 'Biệt danh thành viên đã thay đổi', value: `${oldNickname} => ${newNickname}` })
           .setColor("Yellow")
           .setTimestamp()
           .setThumbnail(`${newMember.user.avatarURL()}`)
          ] 
        });
      } else if(newMember.user.username !== oldMember.user.username) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle(`${newMember.user.tag}`)
            .addFields({ name: 'Tên thành viên đã thay đổi', value: `${oldMember.user.username} => ${newMember.user.username}` })
            .setColor("Yellow")
            .setTimestamp()
            .setThumbnail(`${newMember.user.avatarURL()}`)
          ]
        });
      } else if(newMember.user.avatarURL() !== oldMember.user.avatarURL()) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle(`${newMember.user.tag}`)
            .addFields({ name: 'Hình đại diện thành viên đã thay đổi', value: `${oldMember.user.avatarURL()} => ${newMember.user.avatarURL()}` })
            .setColor("Yellow")
            .setTimestamp()
            .setThumbnail(`${newMember.user.avatarURL()}`)
          ] 
        });
      } else {
        return channels.send({
          content: "[guildMemberUpdate] Đã sảy ra lỗi trong quá trình thực thi kết quả"
        });
      };
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};