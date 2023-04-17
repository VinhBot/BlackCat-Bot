const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["removes"], // lệnh phụ
  description: "Xoá 1 bài hát", // mô tả lệnh
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
    if(!args[0]) return message.reply({
      content: "Vui lòng thêm vị trí bài hát"
    });
    let songIndex = Number(args[0]);
		if(!songIndex) return message.reply({
      content: "Vui lòng thêm số vị trí Bài hát!"
    });
    let amount = Number(args[1] ? args[1] : "1");
		if(!amount) amount = 1;
		if(songIndex > newQueue.songs.length - 1) return message.reply({
      content: "**Bài hát này không tồn tại!**\n" + `**Bài hát cuối cùng trong Hàng đợi, Chỉ đến mục: \`${newQueue.songs.length}\`**`,
		});
		if(songIndex <= 0) return message.reply({
			content: `**Bạn không thể xóa Bài hát hiện tại!**`
	  });
	  if(amount <= 0) return message.reply({
			content: "**Bạn cần xóa ít nhất 1 Bài hát!**"
		});
		newQueue.songs.splice(songIndex, amount);
		return message.reply({
      content: `🗑 **Đã xóa ${amount} Bài hát khỏi Hàng đợi!**`
    });
  },
};