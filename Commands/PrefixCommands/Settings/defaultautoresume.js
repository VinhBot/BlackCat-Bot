const { Database } = require("st.db");
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
    const database = new Database("./Events/Json/defaultDatabase.json", { 
       databaseInObject: true
    });
    if(!args[0]) return message.reply({
      content: "Vui lòng chọn true: bật hoặc false: tắt"
    });
    let autoresume = Boolean(args[0]);
    // Lấy dữ liệu guilds hiện tại từ cơ sở dữ liệu
    const guildData = await database.get(message.guild.id);
    // Cập nhật thuộc tính setDefaultVolume với giá trị mới
    guildData.setDefaultMusicData.setDefaultAutoplay = autoresume;
    // thiết lập thuộc tính với giá trị mới
    await database.set(message.guild.id, guildData);
    return message.reply({
      content: ` Chế độ tự động phát được đặt thành ${autoresume}`
    }); 
  },
};