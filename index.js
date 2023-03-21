const Client = require("./Client");
const config = require("./config.json");
const handlers = new Client({
  setLanguage: "vi",
  setReply: false, // đặt chế độ reply cho bot
  setToken: process.env.token || config.token, // token của bot
  setConnectMongoDB: true, // bật tắt kết nối mongourl || đang thử nhiệm xem có cần thiết hay là không 
  setMongoDB: process.env.mongourl || config.mongourl, // mongourl
});
// xem bot đã on hay chưa, client.on("ready" .......) :)))
handlers.handlerReadyEvents({
  setActivities: [
    "bot discord v14",
    "BlackCat-Club",
    `${config.prefix}help để xem tất cả các lệnh`,
    "@botname help"
  ],
  setStatus: "dnd",
  setTime: 2000,
});
// Khởi chạy Events 
handlers.eventHandler({
  EventPath: "Events/Guild", // đường dẫn của events
  Events: ["Guilds", "Client"] // tên folder
});
// khởi chạy các lệnh slash (/)
handlers.slashHandler({
  setHandlerInteraction: true, // bật tắt hỗ trợ interactionCreate || nếu tắt tính năng này bạn sẽ phải tự custom interactionCreate của discord
  setDeveloper: config.developer, // id của owner || nếu setHandlerInteraction: false, thì cái này sẽ vô dụng
  setSlashCommandPath: "Commands/SlashCommands", // đường dẫn đến file slashCommands
});
// khởi chạy các lệnh prefix commands
handlers.commandHandler({
  setHandlerMessageCreate: false, // bật hoặc tắt messageCreate của package
  setPrefix: "!", // nếu lhi tắt setHandlerMessageCreate: false, thì cái này vô dụng
  setCommandPath: "Commands/PrefixCommands" // set đường dẫn đến commands
});