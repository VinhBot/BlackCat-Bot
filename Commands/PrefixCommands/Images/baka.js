const { fetchRandom } = require('nekos-best.js');
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "gởi ảnh/gif anime " + path.parse(__filename).name, // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Images", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    async function fetchImage() {
      const response = await fetchRandom('baka');
      return response.results[0].url;
    };
    const img = await fetchImage();
    return message.reply({ content: img });
  },
};