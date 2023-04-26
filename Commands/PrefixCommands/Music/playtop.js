const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["ptop"], // lệnh phụ
  description: "Phát Bài hát/Danh sách phát và thêm nó vào Đầu", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Music", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const VoiceChannel = message.member.voice.channel;
    if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
    let newQueue = client.distube.getQueue(message.guildId);
    if(!args[0]) return message.reply({
      content: "Vui lòng nhập tên bài hát hoặc url bài hát"
    });
    const { MusicRole } = require(`${process.cwd()}/Events/functions`);
    if(MusicRole(client, message.member, newQueue.songs[0])) return message.reply({
      content: ` Bạn Không có MusicRole hoặc bạn không phải người yêu cầu bài hát\n(${MusicRole(client, message.member, newQueue.songs[0])})`
    });
    const Text = args.join(" "); 
		let newmsg = await message.reply({
			content: `🔍 Đang tìm kiếm... \`\`\`${Text}\`\`\``,
		}).catch(e => console.log(e));
    await client.distube.play(VoiceChannel, Text, {
      member: message.member,
			unshift: true
    });
    newmsg.edit({
			content: `${queue?.songs?.length > 0 ? "👍 Đã thêm vào đầu hàng đợi" : "🎶 Đang phát"}: \`\`\`css\n${Text}\n\`\`\``,
		}).catch(e => console.log(e));
  },
};