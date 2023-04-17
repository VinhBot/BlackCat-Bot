const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Tăng giảm âm lượng", // mô tả lệnh
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
      content: "**Vui lòng thêm Âm lượng!**"
    });
    let volume = Number(args[0]);
		if(volume > 150 || volume < 0) return message.reply({
			content: "Bạn chỉ có thể nhập số từ \`0\` đến \`150\`"
    });
		await newQueue.setVolume(volume);
	  return message.reply({
      content: `🔊 **Đã thay đổi Âm lượng thành \`${volume}\`!**`
    });
  },
};