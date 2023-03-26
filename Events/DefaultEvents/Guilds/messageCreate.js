const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const database = new Database("./Events/Json/defaultDatabase.json", { 
  databaseInObject: true
});
const config = require(`${process.cwd()}/config.json`);

module.exports = async(client, message) => {
  if(message.author.bot || !message.guild) return;
  const data = await database.get(message.guild.id);
  const prefix = data.setDefaultPrefix;
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
};