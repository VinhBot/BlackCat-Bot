const { Music: database } = require(`${process.cwd()}/Assets/Schemas/database`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: [""], // lệnh phụ
  description: "Thiết lập volume mặc định cho guild", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Settings", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const guildData = await database.findOne({ GuildId: message.guild.id, GuildName: message.guild.name });
    if(!args[0]) return message.reply({
      content: "Vui lòng nhập mức âm lượng mong muốn"
    });
    let volume = Number(args[0]);
    if(!volume || (volume > 150 || volume < 1)) return message.reply({
      content: "Bạn chỉ có thể nhập tối thiểu là 1 và nhiều nhất là 150"
    });
    // Cập nhật thuộc tính setDefaultVolume với giá trị mới
    guildData.setDefaultMusicData.DefaultVolume = volume;
    // thiết lập thuộc tính với giá trị mới
    await guildData.save();
    return message.reply({
      content: `Đã đặt ${volume} làm volume mặc định`,
    });
  },
};