const Client = require("./Events/Client");
const fs = require("node:fs");

const client = new Client();

// chạy các events bên ngoài
fs.readdirSync('./Handlers').forEach((BlackCat) => {
  require(`./Handlers/${BlackCat}`)(client);
});