const { EmbedBuilder } = require("discord.js");

module.exports = {
	eventName: "guildUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: (client, channel) => {
    const data = {
      ChannelID: "1085223809675698260"
    };
    if(!data) return;
    if(newGuild.name !== oldGuild.name) {
      return newGuild.channels.cache.get(data.ChannelID).send({ 
        embeds: [new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("Server Updates")
          .addFields({ name: 'Tên Server đã thay đổi', value: `${oldGuild.name} => ${newGuild.name}` })
          .setThumbnail(`${newGuild.iconURL()}`)
          .setTimestamp()
        ]
      });
    } else if(newGuild.iconURL() !== oldGuild.iconURL()) {
        return newGuild.channels.cache.get(data.ChannelID).send({ 
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields('Avatar của server đã thay đổi', `[Avatar cũ](${oldGuild.iconURL()}) => [Avatar mới](${newGuild.iconURL()})`)
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
          ]
        });
    } else if(newGuild.splashURL() !== oldGuild.splashURL()) {
        return newGuild.channels.cache.get(data.ChannelID).send({ 
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: "Máy chủ Splash đã thay đổi", value: `[Splash cũ](${oldGuild.splashURL()}) => [Splash mới](${newGuild.splashURL()})` })
            .setThumbnail(`${newGuild.splashURL()}`)
            .setTimestamp()
          ]
        });
    } else if (newGuild.memberCount !== oldGuild.memberCount) {
        return newGuild.channels.cache.get(data.ChannelID).send({ 
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: 'Thành viên server đã thay đổi', value: `${oldGuild.memberCount} => ${newGuild.memberCount}` })
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
          ]
        });
    } else if(newGuild.ownerId !== oldGuild.ownerId) {
        const embed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: 'Chủ sở hữu server đã thay đổi', value: `${oldGuild.owner.user.username} => ${newGuild.owner.user.username}` })
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
        return newGuild.channels.cache.get(data.ChannelID).send({ embeds: [embed]})
    } else {
      return newMember.guild.channels.cache.get(data.ChannelID).send({
        content: "Đã sảy ra lỗi trong quá trình thực thi kết quả"
      });
    };
  },
};