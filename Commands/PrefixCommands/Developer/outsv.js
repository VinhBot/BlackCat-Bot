const database = require(`${process.cwd()}/Events/Json/database.json`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: [""], // lệnh phụ
  description: "kéo bot ra khỏi sever chỉ định", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"Developer", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const guildId = args[0] || message.guild;
    const rgx = /^(?:<@!?)?(\d+)>?$/;
    if (!rgx.test(guildId)) return message.reply({ content: "bạn vẫn chưa nhập id server" });
    const guild = message.client.guilds.cache.get(guildId);
    if (!guild) return message.reply({ content: "ID server không đúng vui lòng kiểm tra lại" });
    await guild.leave();
    await message.reply({ embeds: [new ButtonBuilder()
      .setTitle("out sever")
      .setColor(database.colors.vang)
      .setDescription(`Đã rời khỏi server **\`${guild.name}\`** với **\`${guild.memberCount}\`** thành viên👋`)
    ]});
  },
};