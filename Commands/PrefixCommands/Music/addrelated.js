const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Thêm một bài hát tương tự hoặc liên quan đến Bài hát hiện tại!", // mô tả lệnh
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
    let thenewmsg = await message.reply({
			content: `🔍 Tìm kiếm bài hát liên quan cho... **${newQueue.songs[0].name}**`,
		}).catch((e) => {
			console.log(e);
		});
		await newQueue.addRelatedSong();
		await thenewmsg.edit({
			content: `👍 Đã thêm: **${newQueue.songs[newQueue.songs.length - 1].name}**`,
		}).catch((e) => {
			console.log(e);
		});
  },
};