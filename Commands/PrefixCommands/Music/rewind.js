const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Tua lại trong X giây", // mô tả lệnh
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
      content: "**Vui lòng thêm Thời lượng tua lại!**"
    });
    let seekNumber = Number(args[0])
		let seektime = newQueue.currentTime - seekNumber;
		if(seektime < 0) seektime = 0;
		if(seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
    await newQueue.seek(seektime);
		return message.reply({
      content: `⏩ **Tua lại bài hát trong \`${seekNumber} Giây\`!**`
    });
  },
};