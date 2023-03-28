const { Database } = require("st.db");
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
    const database = new Database("./Events/Database/defaultDatabase.json", { 
       databaseInObject: true
    });
    if(!args[0]) return message.reply({
      content: "Vui lòng chọn true: bật hoặc false: tắt"
    });
    const guildData = await database.get(message.guild.id);
    if(args[0] === "bật") {
      var autoplay = Boolean(args[0]);
      // Cập nhật thuộc tính setDefaultVolume với giá trị mới
      guildData.setDefaultMusicData.DefaultAutoplay = autoplay;
    } else {
      var autoplay = Boolean(args[1]);
      // Cập nhật thuộc tính setDefaultVolume với giá trị mới
      guildData.setDefaultMusicData.DefaultAutoplay = autoplay;
    };
    await database.set(message.guild.id, guildData);
    return message.reply({
      content: ` Chế độ tự động phát đã được ${autoplay ? "bật" : "tắt"}`
    }); 
  },
};