const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: [""], // lệnh phụ
  description: "Phát nhạc theo yêu cầu", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Music", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const VoiceChannel = message.member.voice.channel;
    if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
    const string = args.join(' ');
    if(!string) return message.channel.send(`Vui lòng nhập url bài hát hoặc truy vấn để tìm kiếm.`)
    client.distube.play(VoiceChannel, string, {
      member: message.member,
      textChannel: message.channel,
      message
    });
  },
};