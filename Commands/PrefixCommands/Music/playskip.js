const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["pskip"], // lệnh phụ
  description: "Bỏ qua bài hát hiện tại và phát nhạc vừa tìm kiếm", // mô tả lệnh
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
      content: "Vui lòng nhập tên bài hát hoặc url bài hát"
    });
    const Text = args.join(" ");  
		let newmsg = await message.reply({
			content: `🔍 Đang tìm kiếm... \`\`\`${Text}\`\`\``,
	  }).catch((e) => console.log(e));
    await client.distube.play(VoiceChannel, Text, {
      member: message.member,
			skip: true
    });
    newmsg.edit({
			content: `${queue?.songs?.length > 0 ? "⏭ Bỏ qua, phát bài" : "🎶 Đang phát"}: \`\`\`css\n${Text}\n\`\`\``,
		}).catch(e => console.log(e));
  },
};