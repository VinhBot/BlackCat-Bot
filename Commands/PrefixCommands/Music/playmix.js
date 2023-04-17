const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Phát bài hát theo playlist có sẵn", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Music", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const VoiceChannel = message.member.voice.channel;
    if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
    let link = "https://open.spotify.com/playlist/2kLGCKLDSXu7d2VvApmiWg";
    if(args[0]) {
      if(args[0].toLowerCase().startsWith("lofi")) {
        link = "https://open.spotify.com/playlist/2kLGCKLDSXu7d2VvApmiWg";
      } else if(args[0].toLowerCase().startsWith("thattinh")) {
        link = "https://open.spotify.com/playlist/4Aj61H8LI3OdtHLwEf5wo5";
      } else if(args[0].toLowerCase().startsWith("reallove")) {
        link = "https://open.spotify.com/playlist/7yQiYrVwwV8TgGa1FwhCUl";
      } else if(args[0].toLowerCase().startsWith("gaming")) {
        link = "https://open.spotify.com/playlist/5ravtOAghdGsfYeKhFx0xU";
      };
    };
    let newMsg = await message.reply({
			content: `Đang tải **'${args[0] ? args[0] : "Mặc định"}'**`,
		});
    let queue = client.distube.getQueue(message.guildId);
		await client.distube.play(VoiceChannel, link, {
      textChannel: message.channel,
      member: message.member
    });
    newMsg.edit({ content: `${queue?.songs?.length > 0 ? "👍 Đã thêm" : "🎶 Đang phát"}: **'${args[0] ? args[0] : "Mặc định"}'**` });
  },
};