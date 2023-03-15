const { Collection } = require("discord.js");
const { Client } = require("./Events/Client");
const config = require("./config.json");
const { readdirSync } = require("node:fs");
const client = new Client({
  setReply: false,
  setToken: process.env.token || config.token,
  setMongoDB: process.env.mongourl || config.mongourl,
  setStatus: [
    `${config.prefix}help/@botname help`,
    `Prefix: ${config.prefix}`,
  ],
});
// 
client.maps = new Map();
client.aliases = new Collection();
client.commands = new Collection();
client.cooldowns = new Collection();
client.voiceGenerator = new Collection();
client.slashCommands = new Collection(); 
client.categories = require("fs").readdirSync("./Commands");
readdirSync('./Handlers').forEach((BlackCat) => {
  require(`./Handlers/${BlackCat}`)(client)
})