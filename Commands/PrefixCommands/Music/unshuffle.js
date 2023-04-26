const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Bỏ Xáo trộn hàng đợi", // mô tả lệnh
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
    const { MusicRole } = require(`${process.cwd()}/Events/functions`);
    if(MusicRole(client, message.member, newQueue.songs[0])) return message.reply({
      content: ` Bạn Không có MusicRole hoặc bạn không phải người yêu cầu bài hát\n(${MusicRole(client, message.member, newQueue.songs[0])})`
    });
    if(!client.maps.has(`beforeshuffle-${newQueue.id}`))	return message.reply({ 
      content: "**Trước đây không có trộn bài!**"
    });
    newQueue.songs = [newQueue.songs[0], ...client.maps.get(`beforeshuffle-${newQueue.id}`)]
		client.maps.delete(`beforeshuffle-${newQueue.id}`);
		return message.reply({
      content: `🔀 **Đã hủy ${newQueue.songs.length} bài hát bị xáo trộn!**`
    });
  },
};