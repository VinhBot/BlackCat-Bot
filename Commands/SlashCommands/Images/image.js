const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { baseURL } = require(`${process.cwd()}/Events/functions`);
const { fetchRandom } = require('nekos-best.js');
const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];
let categories = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance" ];
let animeGif = ["baka", "bite", "blush", "bored", "cry", "cuddle", "dance", "facepalm", "feed", "happy", "highfive", "hug", "kiss", "laugh", "pat", "poke", "pout", "shrug", "slap", "sleep", "smile", "smug", "stare", "think", "tickle"];
let animeGif2 = ["wave", "wink"];

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
      name: "animegif", 
      description: "xem hình ảnh/gif anime", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "name", 
          description: "bạn muốn xem thể loại nào ?", 
          type: ApplicationCommandOptionType.String,
          required: false, 
          choices: animeGif.map((item) => ({ name: item, value: item })),
        },{
          name: "name2", 
          description: "bạn muốn xem thể loại nào ?", 
          type: ApplicationCommandOptionType.String,
          required: false, 
          choices: animeGif2.map((item) => ({ name: item, value: item })),
        }
      ],
    },{ 
      name: "animegirl", 
      description: "Xem hình ảnh anime của các cô gái", 
      type: ApplicationCommandOptionType.Subcommand
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
    } else if(interaction.options.getSubcommand() === "animegif") {
      const choice = interaction.options.getString("name");
      const choice2 = interaction.options.getString("name2");
      const category = animeGif[Math.floor(Math.random() * animeGif.length)];
      async function fetchImage() {
        const response = await fetchRandom(choice ? choice : choice2 || category);
        return response.results[0].url;
      };
      const img = await fetchImage();
      return interaction.reply({ content: img });
    } else if(interaction.options.getSubcommand() === "animegirl") {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const response = await baseURL(`https://api.waifu.pics/sfw/${category}`);
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

