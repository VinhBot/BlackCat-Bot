const { Client, optionHandlerEvents } = require("./Client");
const config = require("./config.json");
const client = new Client({
  setReply: false, // đặt chế độ reply cho bot
  setToken: process.env.token || config.token,
  setMongoDB: process.env.mongourl || config.mongourl
});

const handlers = new optionHandlerEvents(client, {
  handlerInteraction: false, // đang test 
  handlerMessageCreate: false, // đang test 
});
// khởi chạy ready events
handlers.handlerReadyEvents({
  setStatus: [
    `${config.prefix}help/@botname help`,
    `Prefix: ${config.prefix}`,
  ],
});
// Khởi chạy Events 
handlers.eventHandler({
  EventPath: "Events/Guild",
  Events: ["Guilds", "Client"]
});
// khởi chạy các lệnh slash (/)
handlers.slashHandler({
  setToken: process.env.token || config.token,
  SlashCommandPath: "Commands/SlashCommands",
});
// khởi chạy các lệnh prefix commands
handlers.commandHandler({
  CommandPath: "Commands/PrefixCommands"
});