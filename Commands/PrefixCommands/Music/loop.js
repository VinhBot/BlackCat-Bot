const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Bật/Tắt lặp lại bài hát", // mô tả lệnh
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
    if(!args[0]) return message.reply({ 
      content: "Vui lòng thêm tùy chọn hợp lệ" 
    });
    let loop = String(args[0]);
		if(!["off", "song", "queue"].includes(loop.toLowerCase())) return message.reply({
		  content: "Vui lòng thêm tùy chọn hợp lệ (off, song, queue)"
    });
    if(loop.toLowerCase() == "off") {
      loop = 0;
    } else if(loop.toLowerCase() == "song") {
      loop = 1;
    } else if(loop.toLowerCase() == "queue") {
      loop = 2;
    };
		await newQueue.setRepeatMode(loop);
    if(newQueue.repeatMode == 0) {
			return message.reply({
        content: "Đã tắt Chế độ vòng lặp"
			});
		} else if(newQueue.repeatMode == 1) {
			return message.reply({
        content: "Đã bật vòng lặp bài hát** || (Đã tắt **vòng lặp hàng đợi**) ||"
      });
		} else {
			return message.reply({
        content: "Đã bật vòng lặp hàng đợi!** || (Đã tắt **vòng lặp bài hát**) ||"
		  });
    };
  },
};