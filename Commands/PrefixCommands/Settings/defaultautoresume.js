const database = require(`${process.cwd()}/Assets/Schemas/music`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["dfresume"], // lệnh phụ
  description: "Thiết lập chế độ mặc định tự động phát lại nhạc khi bot gặp lỗi", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Settings", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const guildData = await database.findOne({ GuildId: message.guild.id, GuildName: message.guild.name });
    if(!args[0]) return message.reply({
      content: "Vui lòng chọn true: bật hoặc false: tắt"
    });
    let autoresume = Boolean(args[0]);
    // Cập nhật thuộc tính setDefaultVolume với giá trị mới
    guildData.setDefaultMusicData.DefaultAutoplay = autoresume;
    // thiết lập thuộc tính với giá trị mới
    await guildData.save();
    return message.reply({
      content: ` Chế độ tự động phát được đặt thành ${autoresume}`
    }); 
  },
};