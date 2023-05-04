// commands
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
  
  },
};
// slashCommands
const { ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "", // Tên lệnh 
  description: "", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "Subccommand", 
      description: "Mô tả", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "String", 
        description: "Mô tả", 
        type: ApplicationCommandOptionType.String,
        required: true, 
        choices: [
          { name: "name", value: "value" },
          { name: "name", value: "value" },
        ],
      }],
    },
  ],
  run: async(client, interaction) => {
   
  },
};
// modules
module.exports = (client) => {
    const path = require("node:path");
    const description = {
        name: path.parse(__filename).name,
        filename: path.parse(__filename).name,
        version: "5.0"
    };
    console.log(` :: ⬜️ modules: ${description.name} | Phiên bản đã tải ${description.version} Từ ("${description.filename}")`.red);
    // code
};
// Discord Events 
module.exports = {
	eventName: "ready", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client) => {
    // code
  },
};
// test conmands 
const path = require("node:path");
module.exports = {
  commandName: path.parse(__filename).name,
  commandUsage: path.parse(__filename).name,
  commandAliases: [""], // lệnh phụ
  commandDescription: "", // mô tả lệnh
  commandUserPerms: [], // Administrator, ....
  commandOwner: false, //: tắt // true : bật
  commandCategory:"", // tên folder chứa lệnh
  commandCooldown: 5, // thời gian có thể tái sử dụng lệnh
  commandExecution: async(client, message, args, prefix) => {
    
  },
};