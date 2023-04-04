const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const fs = require("node:fs");
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
    },{
      name: "reset", 
      description: "trở về database gốc", 
      type: ApplicationCommandOptionType.Subcommand, 
    },
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "create") {
      let count = JSON.parse(fs.readFileSync("./Assets/Database/hosterData.json")).counts;
      count++;
      await database.push("project", [
        { counter: count, name: "", age: "", pets: "", a: 0, b: 0, c: 0, d: 0 }
      ]);
      await database.set("counts", count++);
      return interaction.reply({ content: "Đã tạo hoster mới rồi nè :3" });
    } else if(interaction.options.getSubcommand() === "reset") {
      await database.set("project", [
        { counter: 1, name: "", age: "", pets: "", a: 0, b: 0, c: 0, d: 0 }
      ]);
      await database.set("counts", 1);
      return interaction.reply({ content: "Đã xoá tất cả database :3" });
    }
    if(interaction.options.getSubcommand() === "edit") {
      const name = interaction.options.getString("name");
      const data = await database.get("project");
      data.name = name;
      await database.pull("project", data);
      return interaction.reply({ content: `Đã đổi đặt tên thành: ${name}`});
    };
    if(interaction.options.getSubcommand() === "list") {
      const data = await database.get("project");
      if(data) {
        const math = (a, b, c, d) => (a * b) * c + d;
        let embed1 = new EmbedBuilder()
        .setAuthor({ name: client.user.tag , iconURL: client.user.displayAvatarURL() })
        .setColor("Random")
        .setTimestamp()
        await data.map((item) => { //item).slice(0, 8).map((item, i) => {
          embed1.addFields({ name: `#${item.counter}`, value: `tên: ${item.name ? item.name : "Chưa cập nhật"} |lần host: \`${item.guilds ? item.guilds : "Chưa cập nhật"}\` |tiền host: \`${item.money ? item.money : "Chưa cập nhật"}\` |(thực lĩnh: ${math(item.a, item.b, item.c, item.d)})|` })
          return 0;
        });
        return interaction.reply({ embeds: [embed1] });
      } else {
        return interaction.reply({ content: "Chưa có ai trong database" });
      };
    };
  },
};