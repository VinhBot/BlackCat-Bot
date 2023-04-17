const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Nhảy đến một Vị trí cụ thể trong Bài hát", // mô tả lệnh
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
      content: "**Vui lòng thêm Vị trí, Thời lượng được nhập bằng số!**"
    });
    let seekNumber = Number(args[0])
		if(seekNumber > newQueue.songs[0].duration || seekNumber < 0) return message.reply({
			content: `**Vị trí tìm kiếm phải nằm trong khoảng từ \`0\` đến \`${newQueue.songs[0].duration}\`!*`
		});
    await newQueue.seek(seekNumber);
    return message.reply({
      content: `⏺ **Đã tìm đến \`${seekNumber} giây\`!**`
    });
  },
};