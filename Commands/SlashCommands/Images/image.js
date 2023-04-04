const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { baseURL } = require(`${process.cwd()}/Events/functions`);
const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];

module.exports = {
  name: "images", // Tên lệnh 
  description: "Xem hình ảnh theo yêu cầu", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "animal", 
      description: "Xem hình ảnh của động vật", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "name", 
        description: "bạn muốn xem con gì", 
        type: ApplicationCommandOptionType.String,
        required: true, 
        choices: animals.map((animal) => ({ name: animal, value: animal })),
      }],
    },
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "animal") {
      const choice = interaction.options.getString("name");
      const response = await baseURL(`https://some-random-api.ml/animal/${choice}`);
      if(!response.success) return interaction.reply({ content: "Đã sảy ra lỗi vui lòng thử lại sau" });
      await interaction.reply({
        embeds: [new EmbedBuilder()
        .setColor("Random")
        .setImage(response.data?.image)
        .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}` })
        ]
      });
    }   
  },
};

