const { EmbedBuilder, PermissionsBitField, Collection, ActivityType } = require("discord.js");
const { readdirSync } = require("node:fs");
const Client = require("blackcat-djs");
const { Database } = require("st.db");
const { onCoolDown } = require(`./Events/functions`);
const config = require("./config.json");
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true
});
const client = new Client({
  setLanguage: "vi",
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
readdirSync('./Events/HandlerEvnets').forEach((BlackCat) => {
  require(`./Events/HandlerEvnets/${BlackCat}`)(client);
});

// xem bot đã on hay chưa :)))
client.on("ready", () => {
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
  // require("./Events/Dashboard/dashboard.js")(client);
});
const cooldowns = new Collection();
client.on("messageCreate", async(message) => {
  if(message.author.bot || !message.guild) return;
  const data = await database.get(message.guild.id);
  const prefix = data.setDefaultPrefix || config.prefix;
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
  if(!prefixRegex.test(message.content)) return;
  const [ matchedPrefix ] = message.content.match(prefixRegex);
  if(!message.content.startsWith(matchedPrefix)) return;   
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if(message.content.match(mention)) return message.reply({ 
    embeds: [new EmbedBuilder().setDescription("Prefix của tôi là:" + ` \`${prefix}\``)]
  }); 
  if(cmd.length === 0) return;
  let command = client.commands.get(cmd);
  if(!command) command = client.commands.get(client.aliases.get(cmd));
  if(command) {
    try {            
      const embed = new EmbedBuilder().setTitle("Thiếu quyền").setColor("Random")
      if(command.userPerms) {
        if(!message.member.permissions.has(PermissionsBitField.resolve(command.userPerms || []))) return message.reply({ 
          embeds: [embed.setDescription(`Bạn không có quyền ${command.userPerms} để sử dụng lệnh này`)],
        });
      };
      if(onCoolDown(cooldowns, message, command)) return message.reply({
        content: `❌ Bạn đã sử dụng lệnh quá nhanh vui lòng đợi ${onCoolDown(cooldowns, message, command).toFixed()} giây trước khi sử dụng lại \`${command.name}\``
      });
      if(command.owner && message.author.id !== config.developer) return message.reply({ 
        embeds: [embed.setDescription(`Bạn không thể sử dụng lệnh này chỉ có <@${config.developer}> mới có thể sử dụng`)]
      });
      command.run(client, message, args, prefix);                          
    } catch(error) {
      console.log(error.toString());
      message.reply({ content: "Lỗi đã được gởi đi :))" });
    };
  } else return message.reply({ content: `Sai lệnh. nhập ${prefix}help để xem lại tất cả các lệnh` }).then((msg) => {
    setTimeout(() => msg.delete(), 10000);
  });
});