const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { baseURL } = require(`${process.cwd()}/Events/functions`);
const { fetchRandom } = require('nekos-best.js');
let animeGif = ["baka", "bite", "blush", "bored", "cry", "cuddle", "dance", "facepalm", "feed", "handhold", "happy", "highfive", "hug", "kick", "kiss", "laugh", "nod", "nom", "nope", "pat", "poke", "pout", "punch", "shoot", "shrug"];
let animeGif2 = ["slap", "sleep", "smile", "smug", "stare", "think", "thumbsup", "tickle", "wave", "wink", "yeet"];
module.exports = {
  name: "images", // Tên lệnh 
  description: "Xem hình ảnh theo yêu cầu", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "anime", 
      description: "Xem gif anime dễ thương theo yêu cầu", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "name", 
          description: "bạn muốn xem gì", 
          type: ApplicationCommandOptionType.String,
          choices: animeGif.map((animal) => ({ name: animal, value: animal })),
        },{
          name: "name2", 
          description: "bạn muốn xem gì", 
          type: ApplicationCommandOptionType.String,
          choices: animeGif2.map((animal) => ({ name: animal, value: animal })),
        }
      ],
    }
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "anime") {
      const choice = interaction.options.getString("name");
      const choice2 = interaction.options.getString("name2");
      const response = await fetchRandom(choice || choice2);
      return interaction.reply({ content: response.results[0].url });
    };
  },
};

