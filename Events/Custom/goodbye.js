const { welcomeGoodbye: database } = require(`${process.cwd()}/Assets/Schemas/database`);
const { AttachmentBuilder } = require("discord.js");
const Canvas = require('canvas');

module.exports = {
	eventName: "guildMemberRemove", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, member) => {
    return database.findOne({ GuildId: member.guild.id }).then(async(getData) => {
      if(!getData) return; // nếu không có data, return
      const channels = member.guild.channels.cache.find((channel) => {
        return channel.id === getData.GoodbyeChannel;
      });
      if(!channels) return; // nếu không thấy channel, return 
      const canvas = Canvas.createCanvas(1772, 633);     
      const ctx = canvas.getContext('2d');     
      const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/1055150050357022843/1089624908570566836/welcome.png");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#f2f2f2';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      var textString3 = `${member.user.username}`;
      if(textString3.length >= 14) {
        ctx.font = 'bold 100px Genta';
        ctx.fillStyle = '#f2f2f2';
        ctx.fillText(textString3, 720, canvas.height / 2 + 20);
      } else {
        ctx.font = 'bold 150px Genta';
        ctx.fillStyle = '#f2f2f2';
        ctx.fillText(textString3, 720, canvas.height / 2 + 20);
      };
      var textString2 = `#${member.user.discriminator}`;
      ctx.font = 'bold 40px Genta';
      ctx.fillStyle = '#f2f2f2';
      ctx.fillText(textString2, 730, canvas.height / 2 + 58);      
      var textString4 = `Còn lại ${member.guild.memberCount} thành viên.`;
      ctx.font = 'bold 60px Genta';
      ctx.fillStyle = '#f2f2f2';
      ctx.fillText(textString4, 750, canvas.height / 2 + 125);      
      var textString5 = `${member.guild.name}`;
      ctx.font = 'bold 60px Genta';
      ctx.fillStyle = '#f2f2f2';
      ctx.fillText(textString5, 700, canvas.height / 2 - 150);
      ctx.beginPath();
      ctx.arc(315, canvas.height / 2, 250, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: "jpg" }));
      ctx.drawImage(avatar, 65, canvas.height / 2 - 250, 500, 500);      
      channels.send({ 
        files: [new AttachmentBuilder(canvas.toBuffer(), { 
          name: 'goodbye-image.png' 
        })]
      }); 
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};