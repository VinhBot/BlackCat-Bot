const { ApplicationCommandOptionType } = require("discord.js");
const { Database } = require("st.db");
const autoresponsedata = new Database("./Assets/Database/autoresponse.json", { 
  databaseInObject: true 
});
module.exports = {
  name: "autoresponse", // Tên lệnh 
  description: "Tự động phản hồi tin nhắn", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "add", 
      description: "thêm phàn hồi", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "name", 
          description: "Thêm tên cho response", 
          type: ApplicationCommandOptionType.String,
          required: true, 
        }, {
          name: "response", 
          description: "Thêm câu trả lời cho name vừa nhập hồi nãy", 
          type: ApplicationCommandOptionType.String,
          required: true, 
        }
      ],
    }
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "add") {
      const name = interaction.options.getString("name");
      const response = interaction.options.getString("response");
      await autoresponsedata.push(interaction.guild.id, [
        { name: name, responses: response }
      ]);
      return interaction.reply({ content: `Đã thêm ${name} là câu hỏi và ${response} là câu trả lời` })
    };
  },
};