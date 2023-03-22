const { ActivityType } = require("discord.js");
const { readdirSync } = require("node:fs");
const Client = require("blackcat-djs");
const config = require("./config.json");
const client = new Client({
  setLanguage: "vi",
  setReply: false, // đặt chế độ reply cho bot
  setToken: process.env.token || config.token, // token của bot
  setDeveloper: config.developer,
});
// xem bot đã on hay chưa, client.on("ready" .......) :)))
client.on("ready", () => {
  console.log(`${client.user.username} đã sẵn sàng hoạt động`.red); 
  const setActivities = [
    `${client.guilds.cache.size} Guilds, ${client.guilds.cache.map(c => c.memberCount).filter(v => typeof v === "number").reduce((a, b) => a + b, 0)} member`,
    `BlackCat-Club`
  ];
  setInterval(() => {
    client.user.setPresence({
      activities: [{
        name: setActivities[Math.floor(Math.random() * setActivities.length)], 
        type: ActivityType.Playing
      }],
      status: 'dnd',
    });
  }, 5000);
});
// khởi chạy các lệnh slash (/)
client.slashHandler({
  setHandlerInteraction: true, // bật tắt hỗ trợ interactionCreate || nếu tắt tính năng này bạn sẽ phải tự custom interactionCreate của discord
  setSlashCommandPath: `${process.cwd()}/Commands/SlashCommands`, // đường dẫn đến file slashCommands
});
// khởi chạy các lệnh prefix commands
client.commandHandler({
  setHandlerMessageCreate: true, // bật hoặc tắt messageCreate của package
  setPrefix: config.prefix, // nếu lhi tắt setHandlerMessageCreate: false, thì cái này vô dụng
  setCommandPath: `${process.cwd()}/Commands/PrefixCommands` // set đường dẫn đến commands
});
// chạy các events bên ngoài
readdirSync('./Events/HandlerEvnets').forEach((BlackCat) => {
  require(`./Events/HandlerEvnets/${BlackCat}`)(client);
});