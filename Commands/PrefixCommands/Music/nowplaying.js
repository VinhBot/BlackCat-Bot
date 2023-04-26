const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xem bài hát hiện tại đang phát", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Music", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const VoiceChannel = message.member.voice.channel;
    if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
    let newQueue = client.distube.getQueue(message.guildId);
		if(!newQueue || !newQueue.songs || newQueue.songs.length == 0) return message.reply({
			embeds: [new EmbedBuilder().setColor("Random").setTitle("Danh sách nhạc trống")],
	  });
    const memberVoice = message.guild.members.me.voice.channel || null;
    const voiceChannelMembers = memberVoice.members.filter((member) => !member.user.bot);
    const nowEmbed = new EmbedBuilder()
    .setColor("Random")
    .setDescription(`Đang phát **[${newQueue.songs[0].name} (${newQueue.songs[0].formattedDuration})](${newQueue.songs[0].url})** có ${voiceChannelMembers.size} người đang nghe trong <#${VoiceChannel.id}>`)
    .setThumbnail(newQueue.songs[0]?.thumbnail)
    .setFooter({
        text: `Bài hát được yêu cầu bởi ${newQueue.songs[0].user.tag}`,
        iconURL: newQueue.songs[0].user.displayAvatarURL({ size: 1024 })
    })
    .addFields([
      { name: "**Volume**", value: `\`${newQueue.volume}%\`` },
      { name: "**Filters**", value: `\`${newQueue.filters.names.join(', ') || 'Tắt'}\`` },
      { name: "**Vòng lặp**", value: `\`${newQueue.repeatMode ? newQueue.repeatMode === 2 ? 'Tất Cả Hàng đợi' : 'Bài hát này' : 'Tắt'}\`` },
      { name: "**Tự động phát**", value: `\`${newQueue.autoplay ? 'Bật' : 'Tắt'}\`` },
    ]);
    if(newQueue.songs[0].views) nowEmbed.addFields({
      name: '👀 Views:',
      value: `${numberWithCommas(newQueue.songs[0].views)}`,
      inline: true
    });
    if(newQueue.songs[0].likes) nowEmbed.addFields({
      name: '👍🏻 Likes:',
      value: `${numberWithCommas(newQueue.songs[0].likes)}`,
      inline: true
    });
    if(newQueue.songs[0].dislikes) nowEmbed.addFields({
      name: '👎🏻 Dislikes:',
      value: `${numberWithCommas(newQueue.songs[0].dislikes)}`,
      inline: true
    });
    return await message.reply({ 
      embeds: [nowEmbed]
    });
  },
};

function numberWithCommas(number) { // 1000 to 1,000
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};