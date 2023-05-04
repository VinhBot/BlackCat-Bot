const { EmbedBuilder } = require("discord.js");

module.exports = {
	eventName: "guildUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: (client, channel) => {
    const data = {
      ChannelID: "1085223809675698260"
    };
    if(!data) return;
    let guilds = client.guilds.cache.get("1055150050357022840");
    let channels = guilds.channels.cache.get(data.ChannelID);
    if(newGuild.name !== oldGuild.name) {
      return channels.send({
        embeds: [new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("Server Updates")
          .addFields({ name: 'Tên Server đã thay đổi', value: `${oldGuild.name} => ${newGuild.name}` })
          .setThumbnail(`${newGuild.iconURL()}`)
          .setTimestamp()
        ]
      });
    } else if(newGuild.iconURL() !== oldGuild.iconURL()) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields('Avatar của server đã thay đổi', `[Avatar cũ](${oldGuild.iconURL()}) => [Avatar mới](${newGuild.iconURL()})`)
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
          ]
        });
    } else if(newGuild.splashURL() !== oldGuild.splashURL()) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: "Máy chủ Splash đã thay đổi", value: `[Splash cũ](${oldGuild.splashURL()}) => [Splash mới](${newGuild.splashURL()})` })
            .setThumbnail(`${newGuild.splashURL()}`)
            .setTimestamp()
          ]
        });
    } else if (newGuild.memberCount !== oldGuild.memberCount) {
        return channels.send({
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
        return channels.send({ embeds: [embed] });
    } else {
      return channels.send({
        content: "Đã sảy ra lỗi trong quá trình thực thi kết quả"
      });
    };
  },
};