const { theme, welconmeGoodbyeCh } = require(`${process.cwd()}/Events/Dashboard/dashboard.js`);
const { setupDatabase } = require(`${process.cwd()}/Events/functions`);
const { ActivityType } = require("discord.js");
const DBD = require("discord-dashboard");
const { Prefix: prefixSchema } = require(`${process.cwd()}/Assets/Schemas/database`);
const config = require(`${process.cwd()}/config.json`);

const dashboard = async(client, options) => {
  if(options) {
    const botClient = {
      id: process.env.botID,
      secret: process.env.botSecret
    };
    const redirectUri = process.env.redirectUri;
    await DBD.useLicense(config.dashboard.useLicense);
    DBD.Dashboard = DBD.UpdatedClass();
    const Dashboard = new DBD.Dashboard({
      port: config.dashboard.port,
      client: botClient || config.dashboard.client,
      redirectUri: redirectUri || config.dashboard.redirectUri,
      domain: config.dashboard.domain,
      ownerIDs: config.dashboard.ownerIDs,
      useThemeMaintenance: true,
      useTheme404: true,
      bot: client,
      theme: theme(client, config),
      settings: [
        welconmeGoodbyeCh(client, config), 
      ]
    });
    return Dashboard.init();
  };
};
    
module.exports = {
	eventName: "ready", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client) => {
    /*========================================================
    # Xem bot đã online hay chưa
    ========================================================*/
    console.log(`${client.user.username} đã sẵn sàng hoạt động`.red); 
    const setActivities = [ 
      `${client.guilds.cache.size} Guilds, ${client.guilds.cache.map(c => c.memberCount).filter(v => typeof v === "number").reduce((a, b) => a + b, 0)} member`,
      `BlackCat-Club`
    ];
    setInterval(() => {
      client.user.setPresence({
        activities: [{ name: setActivities[Math.floor(Math.random() * setActivities.length)], type: ActivityType.Playing }],
        status: 'dnd',
      });
    }, 5000);
    /*========================================================
    # Dashboard
    ========================================================*/
    dashboard(client, false);
  },
};