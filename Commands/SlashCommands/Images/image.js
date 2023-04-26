const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { baseURL } = require(`${process.cwd()}/Events/functions`);
const fetch = require("node-fetch");
const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];
let categories = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance" ];

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
    },{ 
      name: "animegirl", 
      description: "Xem hình ảnh anime của các cô gái", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "type", 
        description: "bạn muốn xem loại nào", 
        type: ApplicationCommandOptionType.String,
        required: false, 
        choices: [
          { name: "nsfw", value: "nsfw" }
        ],
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
    } if(interaction.options.getSubcommand() === "animegirl") {
      const type = interaction.options.getString("type");
      if(type === "nsfw" && !interaction.channel.nsfw) return interaction.reply({
				content: "Bạn chỉ có thể sử dụng tùy chọn NSFW trong các kênh nsfw",
			}).catch((err) => console.log(err));
      if(type === "nsfw") {
        categories = ["waifu", "neko", "trap", "blowjob"]
      };
      const category = categories[Math.floor(Math.random() * categories.length)];
      const response = await baseURL(`https://api.waifu.pics/${type === "nfsw" ? "nfsw":"sfw"}/${category}`);
      if(!response.success) {
        return interaction.reply({ 
          content: "Có lỗi sảy ra vui lòng thử lại sau"
        }).catch((e) => console.log(e));
      } else {
	      return interaction.reply({ content: response.url }).catch((e) => console.log(e));
      };
    };
  },
};

