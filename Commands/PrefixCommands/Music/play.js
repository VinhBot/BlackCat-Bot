const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["p"], // lệnh phụ
  description: "Phát nhạc theo yêu cầu", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Music", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const VoiceChannel = message.member.voice.channel;
    if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
    const Text = args.join(" ");
    if(!Text) return message.channel.send(`Vui lòng nhập url bài hát hoặc truy vấn để tìm kiếm.`);
    let newmsg = await message.reply({
			content: `🔍 Đang tìm kiếm bài hát:  \`\`\`${Text}\`\`\``,
		}).catch((e) => {
			console.log(e)
		});
    client.distube.play(VoiceChannel, Text, {
      member: message.member,
      textChannel: message.channel,
      message
    });
    let queue = client.distube.getQueue(message.guildId);
    newmsg.edit({
			content: `${queue?.songs?.length > 0 ? "👍 Thêm" : "🎶 Đang phát"}: \`\`\`css\n${Text}\n\`\`\``,
		}).catch((e) => {
			console.log(e)
		});
  },
};