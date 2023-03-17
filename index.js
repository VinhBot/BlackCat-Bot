const { Client } = require("./Events/Client");
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

client.eventHandler({
  EventPath: `${process.cwd()}/Events/Guild/`,
  Events: ["Guilds", "Client"]
});
client.commandHandler({
  CommandPath: `${process.cwd()}/Commands/PrefixCommands`
});
client.slashHandler({
  setToken: process.env.token || config.token,
  SlashCommandPath: `${process.cwd()}/Commands/SlashCommands/`,
});