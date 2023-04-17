const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Di chuyển một bài hát đến nơi khác", // mô tả lệnh
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
      content: "**Vui lòng thêm Vị trí bài hát!**"
    });
    if(!args[1]) return message.reply({
      content: "**Vui lòng thêm Vị trí cần di chuyển!**"
    });
    let songIndex = Number(args[0]);
    if(!songIndex) return message.reply({
      content: "**Vui lòng thêm SỐ Vị trí bài hát!**"
    });
    let position = Number(args[1]);
	  if(!position) return message.reply({
      content: "**Vui lòng thêm SỐ Di chuyển Vị trí!**"
    });
    if(position >= newQueue.songs.length || position < 0) position = -1;
		if(songIndex > newQueue.songs.length - 1) return message.reply({
      content: `Bài hát này không tồn tại\n**Bài hát cuối cùng trong Hàng đợi, Chỉ đến mục: \`${newQueue.songs.length}\`**`
    });
		if(position == 0) return message.reply({
      content: " **Không thể di chuyển Bài hát trong khi Phát Bài hát!**"
    });
    let song = newQueue.songs[songIndex];
		newQueue.songs.splice(songIndex);
		newQueue.addToQueue(song, position)
	  return message.reply({
      content: `📑 Đã di chuyển **${song.name}** đến vị trí **\`${position}\`** ngay sau **_${newQueue.songs[position - 1].name}_!**`
    });
  },
};