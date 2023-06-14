const { Music: database } = require(`${process.cwd()}/Assets/Schemas/database`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["autoplaydf"], // lệnh phụ
  description: "Thiết lập chế độ mặc định tự động phát nhạc", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Settings", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const guildData = await database.findOne({ GuildId: message.guild.id, GuildName: message.guild.name });
    if(!args[0]) return message.reply({
      content: "Vui lòng chọn true: bật hoặc false: tắt"
    });
    if(args[0] === "bật") {
      var autoplay = Boolean(args[0]);
      guildData.setDefaultMusicData.DefaultAutoplay = autoplay;
    } else {
      var autoplay = Boolean(args[1]);
      guildData.setDefaultMusicData.DefaultAutoplay = autoplay;
    };
    await guildData.save();
    return message.reply({
      content: ` Chế độ tự động phát đã được ${autoplay ? "bật" : "tắt"}`
    }); 
  },
};