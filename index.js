const { Client, optionHandlerEvents } = require("./Client");
const config = require("./config.json");
const client = new Client({
  setReply: false,
  setToken: process.env.token || config.token,
  setMongoDB: process.env.mongourl || config.mongourl,
  setStatus: [
    `${config.prefix}help/@botname help`,
    `Prefix: ${config.prefix}`,
  ],
});

const handlers = new optionHandlerEvents(client, {
  setClient: config, // test thôi nên chả có tác dụng gì đâu
});

handlers.eventHandler({
  EventPath: `${process.cwd()}/Events/Guild/`,
  Events: ["Guilds", "Client"]
});
handlers.slashHandler({
  setToken: process.env.token || config.token,
  SlashCommandPath: "Commands/SlashCommands",
});
handlers.commandHandler({
  CommandPath: "Commands/PrefixCommands"
});