const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];
const { EmbedBuilder } = require("discord.js");
const path = require("node:path");


const fetch = require("node-fetch");
const baseURL = async(url, options) => {
  const response = options ? await fetch(url, options) : await fetch(url);
  const json = await response.json();
  return {
    success: response.status === 200 ? true : false,
    status: response.status,
    data: json,
  };
};

module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xem hình ảnh các con vật", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Images", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    const choice = args[0];
    if(!animals.includes(choice)) return message.safeReply({
      content: `Động vật được chọn không hợp lệ. động vật có sẵn:\n${animals.join(", ")}`
    });
    const response = await baseURL(`https://some-random-api.ml/animal/${choice}`);
    if(!response.success) return message.reply({ content: "Có lỗi sảy ra vui lòng thử lại sau" });
    return message.reply({ embeds: [new EmbedBuilder()
    .setColor("Random")
    .setImage(response.data?.image)
    .setFooter({ text: `yêu cầu bởi ${message.author.id}` })
    ]});
  },
};