const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["skipto"], // lệnh phụ
  description: "Chuyển đến một Bài hát cụ thể trong Hàng đợi", // mô tả lệnh
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
    let Position = Number(args[0])
		if(Position > newQueue.songs.length - 1 || Position < 0) return message.reply({
			embeds: [new EmbedBuilder().setColor("Random").setTitle(`**Vị trí phải nằm trong khoảng từ \`0\` đến \`${newQueue.songs.length - 1}\`!**`)],
		});
		await newQueue.jump(Position);
		return message.reply({
      content: `👌 **Đã nhảy tới Bài hát thứ \`${Position}\` trong hàng đợi!**`
    });
  },
};