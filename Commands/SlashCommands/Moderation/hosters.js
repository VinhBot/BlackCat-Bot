const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const database = new Database("./Assets/Database/hosterData.json", { 
  databaseInObject: true
});
module.exports = {
  name: "hoster", // Tên lệnh 
  description: "tesy", // Mô tả lệnh
  userPerms: ["Administrator"], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "list", 
      description: "xem danh sách hoster", 
      type: ApplicationCommandOptionType.Subcommand, 
    },{ 
      name: "create", 
      description: "tạo hoster mới", 
      type: ApplicationCommandOptionType.Subcommand, 
    },{
      name: "edit", 
      description: "tạo ticket cho server", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "name", 
        description: "zzzzzz", 
        type: ApplicationCommandOptionType.String,
        required: true, 
      }],
    },
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "create") {
      await database.push("project", [
        { name: "", guilds: "", money: '', a: "", b: "", c: "", d: "" }
      ]);
      return interaction.reply({ content: "Đã tạo hoster mới rồi nè :3" });
    };
    if(interaction.options.getSubcommand() === "edit") {
      const name = interaction.options.getString("name");
      const data = await database.get("project");
      data.name = name;
      await database.push("project", data);
      return interaction.reply({ content: `Đã đổi đặt tên thành: ${name}`});
    };
    if(interaction.options.getSubcommand() === "list") {
      const data = await database.get("project");
      function math(a, b, c, d) {
        return (a * b) * c + d;
      };
      let embed1 = new EmbedBuilder()
      .setAuthor({ name: client.user.tag , iconURL: client.user.displayAvatarURL() })
      .setColor("Random")
      .setTimestamp()
      await data.map(item => item).slice(0, 8).map((item, i) => {
        embed1.addFields({ name: `#${i+1}`, value: `tên: ${item.name ? item.name : "Chưa cập nhật"} |lần host: \`${item.guilds ? item.guilds : "Chưa cập nhật"}\` |tiền host: \`${item.money ? item.money : "Chưa cập nhật"}\` |(thực lĩnh: ${math(item.a, item.b, item.c, item.d)})|` })
        return 0;
      });
      return interaction.reply({ embeds: [embed1] });
    };
  },
};