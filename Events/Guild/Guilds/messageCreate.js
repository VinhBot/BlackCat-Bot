const { EmbedBuilder, PermissionsBitField, Collection } = require("discord.js");
const { onCoolDown } = require("../../functions");
const config = require(`${process.cwd()}/config.json`);    
const { GPrefix } = require(`../../OptionsSchema.js`);
const database = require("../../Json/database.json");


module.exports = async(client, message) => {
  if(message.author.bot || !message.guild) return;
  var PREFIX = config.prefix;
  const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
  if(GuildPrefix && GuildPrefix.prefix) PREFIX = GuildPrefix.prefix;
  client.prefix = PREFIX;
  /*--------------------
  # Bắt đầu chạy bot
  --------------------*/
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(client.prefix)})\\s*`);
  if(!prefixRegex.test(message.content)) return;
  const [ matchedPrefix ] = message.content.match(prefixRegex);
  if(!message.content.startsWith(matchedPrefix)) return;       
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  // bot reply khi ai đó tag nó <@blackcat + tên lệnh hoăch chỉ @blackcat đơn thuần để xem prefix > 
  if(message.content.match(mention)) return message.reply({ 
    embeds: [new EmbedBuilder().setDescription(`Prefix của tôi là: \`${client.prefix}\``)]
  }); 
  if(cmd.length === 0) return;
  let command = client.commands.get(cmd);
  if(!command) command = client.commands.get(client.aliases.get(cmd));
  if(command) {
    try {            
      const embed = new EmbedBuilder().setTitle("Thiếu quyền").setColor(database.colors.vang)
             /*--------------------
             # thời gian hồi lệnh
             --------------------*/
             if(onCoolDown(message, command)) return message.channel.send({ 
               content: `❌ vui lòng chờ ${onCoolDown(message, command)} giây trước khi sử dụng lại lệnh ${command.name}`
             });
             /*--------------------
             # giới hạn quyền sử dụng lệnh
             --------------------*/
             if(command.userPerms) {
                if(!message.member.permissions.has(PermissionsBitField.resolve(command.userPerms || []))) return message.reply({ 
                  embeds: [embed.setDescription(`bạn không có quyền ${command.userPerms} để sử dụng lệnh ${command.name} trong ${message.channelId}`)] 
                });
              };
              /*--------------------
              # dev commands
              --------------------*/
      if(command.owner && message.author.id !== config.developer) return message.reply({ 
        embeds: [embed.setDescription(`Lệnh này chỉ <@${config.developer}> mới có thể sử dụng`)]
      });
      /*--------------------
      # kết thúc
      --------------------*/
      command.run(client, message, args, database, prefix = client.prefix);        
      client.channels.cache.get(database.channelLog).send({ embeds: [new EmbedBuilder()
        .setColor(database.colors.vang)
        .setFooter({ text: `${database.name}`, iconURL: `${database.avatar}`})
        .setTimestamp(Date.now())
        .setDescription(` \`Tên Discord : ${message.guild.name}\`\n\`Tên Kênh  SD: ${message.channel.name}\`\n\`Tên Người SD: ${message.author.tag}\`\n \`Lệnh được SD: ${message.content}\``)
      ]});                          
    } catch(error) {
      console.log(error.toString());
      message.reply({ content: `[MessageCreate]: lỗi đã được gởi đi` });
    };
  } else return message.reply({ content: `\`sai lệnh. vui lòng \n${client.prefix}help để xem lại tất cả các lệnh\`` }).then((msg) => {
    setTimeout(() => msg.delete(), 10000);
  });
};