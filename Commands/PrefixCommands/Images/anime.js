const { fetchRandom } = require('nekos-best.js');
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "gởi ảnh/gif anime theo yêu cầu", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Images", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const optionsName = args[0];
    if(!optionsName) return message.reply({
      content: "vui lòng nhập một trong số các tên dưới đây: \`baka, bite, blush, bored, cry, cuddle, dance, facepalm, feed, handhold, happy, highfive, hug, kick, kiss, laugh, nod, nom, nope, pat, poke, pout, punch, shoot, shrug, slap, sleep, smile, smug, stare, think, thumbsup, tickle, wave, wink, yeet, husbando, kitsune, neko, waifu\`"
    });
    try {
      const response = await fetchRandom(optionsName);
      return message.reply({ content: response.results[0].url });
    } catch(error) {
      return message.reply("Bạn đã nhập sai tên anime rồi, vui lòng thử lại");
    };
  },
};