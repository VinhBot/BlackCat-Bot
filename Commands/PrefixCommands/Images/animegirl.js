const { baseURL } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: ["animeg"], // lệnh phụ
  description: "Chọn một hình ảnh anime cô gái ngẫu nhiên!", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Images", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    let categories = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance" ];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const response = await baseURL(`https://api.waifu.pics/sfw/${category}`);
    if(!response.success) return message.reply({ content: "Có lỗi sảy ra vui lòng thử lại sau" });
	  return message.reply({ content: response.data.url }).catch((err) => {});
  },
};