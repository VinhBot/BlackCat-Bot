const { Client, optionHandlerEvents } = require("./Client");
const config = require("./config.json");
const client = new Client({
  setReply: false, // đặt chế độ reply cho bot
  setToken: process.env.token || config.token,
  setMongoDB: process.env.mongourl || config.mongourl
});

const status = [
  `${config.prefix}help/@botname help`,
  `Prefix: ${config.prefix}`,
];
const handlers = new optionHandlerEvents(client, {
  // bot ready
  setStatus: status,
});
// Khởi chạy Events 
handlers.eventHandler({
  EventPath: "Events/Guild", // đường dẫn của events
  Events: ["Guilds", "Client"] // tên folder
});
// khởi chạy các lệnh slash (/)
handlers.slashHandler({
  setHandlerInteraction: true,
  setDeveloper: config.developer,
  setToken: process.env.token || config.token,
  setSlashCommandPath: "Commands/SlashCommands",
});
// khởi chạy các lệnh prefix commands
handlers.commandHandler({
  setHandlerMessageCreate: false, // bật hoặc tắt messageCreate của package
  setPrefix: "!", // nếu lhi tắt messageCreate thì cái này vô dụng
  setCommandPath: "Commands/PrefixCommands" // set đường dẫn đến commands
});