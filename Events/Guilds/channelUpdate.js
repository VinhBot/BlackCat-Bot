const { EmbedBuilder } = require('discord.js')

module.exports = {
	eventName: "channelUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, oldChannel, newChannel) => {
    const data = {
      ChannelID: "1085223809675698260"
    };
    if(!data) return;
    try {
    if(oldChannel.name !== newChannel.name) {
        const nameEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Tên kênh đã thay đổi', value: `${oldChannel.name} -> ${newChannel.name}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [nameEmbed] })
    } else if(oldChannel.topic !== newChannel.topic) {
        const topicEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Chủ đề kênh đã thay đổi', value: `${oldChannel.topic} -> ${newChannel.topic}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [topicEmbed] })
    } else if(oldChannel.position !== newChannel.position) {
        const positionEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Vị trí kênh đã thay đổi', value: `${oldChannel.position} -> ${newChannel.position}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [positionEmbed] })
    } else if(oldChannel.type !== newChannel.type) {
        const typeEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Loại kênh đã thay đổi', value: `${oldChannel.type} -> ${newChannel.type}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [typeEmbed] })
    } else if(oldChannel.nsfw !== newChannel.nsfw) {
        const nsfwEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Kênh NSFW đã thay đổi', value: `${oldChannel.nsfw} -> ${newChannel.nsfw}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [nsfwEmbed] })
    } else if(oldChannel.bitrate !== newChannel.bitrate) {
        const bitrateEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Tốc độ bit của kênh đã thay đổi', value: `${oldChannel.bitrate} -> ${newChannel.bitrate}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [bitrateEmbed] })
    } else if(oldChannel.userLimit !== newChannel.userLimit) {
        const userLimitEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Đã thay đổi giới hạn người dùng kênh', value: `${oldChannel.userLimit} -> ${newChannel.userLimit}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [userLimitEmbed] })
    } else if(oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        const rateLimitPerUserEmbed = new EmbedBuilder()
        .setTitle('Channel Updates')
        .addFields({ name: 'Kênnh RateLimitPerUser đã thay đổi', value: `${oldChannel.rateLimitPerUser} -> ${newChannel.rateLimitPerUser}` })
        .setColor("Green")
        .setTimestamp()
        newChannel.guild.channels.cache.get(data.ChannelID).send({ embeds: [rateLimitPerUserEmbed] })
    } else {
      return newChannel.guild.channels.cache.get(data.ChannelID).send({
        content: "[channelUpdate]: Đã sảy ra lỗi trong quá trình thực thi kết quả"
      });                                             
    };
    } catch(e) {
      console.log(e)
    };
  },
};