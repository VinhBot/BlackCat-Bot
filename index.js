const Client = require("blackcat-djs");
const fs = require("node:fs");
const config = require("./config.json");

const client = new Client({
  setLanguage: "vi", // thiết lập ngôn ngữ cho package
  setReply: false, // đặt chế độ reply cho bot
  setToken: process.env.token || config.token, // token của bot
  setDeveloper: config.developer,
});

// khởi chạy các lệnh slash (/)
client.slashHandler({
  setHandlerInteraction: true, // bật tắt hỗ trợ interactionCreate || nếu tắt tính năng này bạn sẽ phải tự custom interactionCreate của discord
  setSlashCommandPath: `${process.cwd()}/Commands/SlashCommands`, // đường dẫn đến file slashCommands
});
// khởi chạy các lệnh prefix commands
client.commandHandler({
  setHandlerMessageCreate: false, // bật hoặc tắt messageCreate của package
  setPrefix: config.prefix, // nếu lhi tắt setHandlerMessageCreate: false, thì cái này vô dụng
  setCommandPath: `${process.cwd()}/Commands/PrefixCommands` // set đường dẫn đến commands
});

// chạy các events bên ngoài
fs.readdirSync('./Handlers').forEach((BlackCat) => {
  require(`./Handlers/${BlackCat}`)(client);
});