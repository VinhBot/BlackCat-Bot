const { welcomeGoodbye: database } = require(`${process.cwd()}/Assets/Schemas/database`);
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { join } = require('node:path');
const Canvas = require('canvas');
const axios = require('axios');

module.exports = {
	eventName: "guildMemberAdd", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, member) => {
    return database.findOne({ GuildId: member.guild.id, GuildName: member.guild.name }).then(async(getData) => {
      const profile = {
         "dot":"https://cdn.discordapp.com/attachments/869133321010032731/889068805060435979/dot.png",
         "status": {
           "online": "https://cdn.discordapp.com/attachments/869133321010032731/889033864297713664/online.png",
           "offline": "https://cdn.discordapp.com/attachments/869133321010032731/889033861630152734/offline.png",
           "idle": "https://cdn.discordapp.com/attachments/869133321010032731/889041955248549898/idle.png",
           "dnd": "https://cdn.discordapp.com/attachments/869133321010032731/889033858601857024/dnd.png"
        },
        "main_profile": "https://cdn.discordapp.com/attachments/869133321010032731/889093992367673354/main_profile.png",
        "raw_profile": "https://cdn.discordapp.com/attachments/869133321010032731/889033867724468224/raw_profile.png"
      };
      if(!getData) return;
      const channels = member.guild.channels.cache.find((channel) => {
        return channel.id === getData.WelcomeChannel;
      });
      if(!channels) return;
      Canvas.registerFont(join(__dirname, '..', '..', 'Assets', 'Fonts', 'HelveticaNeue.otf'), { family: 'HelveticaNeue', weight: "regular", style: "normal" });
      Canvas.registerFont(join(__dirname, '..', '..', 'Assets', 'Fonts', 'HelveticaNeue-Bold.otf'), { family: 'HelveticaNeueBold', weight: "regular", style: "normal" });
      // create canvas
      let banner;
      let response = await axios(`https://discord.com/api/v10/users/${member.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bot ${process.env.token}`
        }
      });
      if(response.data.banner) {
        banner = `https://cdn.discordapp.com/banners/${member.id}/${response.data.banner}.png?size=1024`
      } else {
        banner = `https://some-random-api.ml/canvas/colorviewer?hex=${response.data.banner_color ? response.data.banner_color.replace("#", ``) : `ccffcc`}`;
      };
      const activity = member.presence.activities.length === 0 ? { status: "Không có", other: [], } : member.presence.activities.reduce((activities, activity) => {
        activities.status = activity.state;
        return activities;
      }, { status: "Không có", other: [], });
      
      let status = member.presence ? member.presence.status : 'offline';
      const canvas = Canvas.createCanvas(375, 360);
      const ctx = canvas.getContext('2d');
      const banner_1 = await Canvas.loadImage(banner);
      ctx.drawImage(banner_1, 0, 0, canvas.width, 147);
      ctx.save();
      ctx.beginPath();
      ctx.arc(78, 148.2, 106 / 2 - 3, 0, Math.PI * 2, false);
      ctx.lineWidth = 0;
      ctx.fillStyle = '#777';
      ctx.fill();
      ctx.closePath();
      ctx.clip();
      const avatar_2 = await Canvas.loadImage(member.user.displayAvatarURL({ dynamic: false, extension: "jpg" }));
      ctx.drawImage(avatar_2, 28, 93, 106, 106);
      ctx.restore()
      const profile_3 = await Canvas.loadImage(profile.main_profile);
      ctx.drawImage(profile_3, 0, 0, canvas.width, canvas.height);
      const dot_4 = await Canvas.loadImage(profile.dot);
      ctx.drawImage(dot_4, 0, 0, canvas.width, canvas.height);
      const status_5 = await Canvas.loadImage(profile.status[status]);
      ctx.drawImage(status_5, 0, 0, canvas.width, canvas.height);
      const profileFlag = [
        "https://cdn.discordapp.com/attachments/869133321010032731/889041954296430642/brilliance.png",
        "https://cdn.discordapp.com/attachments/869133321010032731/889033855720390686/blance.png",
        "https://cdn.discordapp.com/attachments/869133321010032731/889033856852828220/bravery.png",
      ];
      const randomPr = profileFlag[Math.floor(Math.random() * profileFlag.length)];
      const badge_6 = await Canvas.loadImage(randomPr);
      ctx.drawImage(badge_6, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = "left";
      ctx.font = `bold 25px HelveticaNeueBold`
      ctx.fillText(member.user.username, 20, 251);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#b9bbbe';
      ctx.fillText(`#${member.user.discriminator}`, ctx.measureText(`${member.user.username}`).width + 22, 251);
      ctx.textAlign = 'left';
      ctx.font = `20px HelveticaNeueBold`
      ctx.fillText(activity?.status?.length > 22 ? activity?.status.slice(0, 22) + "..." : activity?.status, 20, 339);
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'image.png' });
      channels.send({ embeds: [new EmbedBuilder()
         .setTitle("Welcome " + member.user.username)
         .setDescription(`
🏤 chào mừng <@${member.user.id}> đã đến với ${member.guild.name} 
📝 xin vui lòng xem qua luật tại <#1089119081304707102>

🌟 Chúc bạn có những giây phút vui vẻ và thoải mái tại ${member.guild.name} cảm ơn.
        
🤔 bạn là thành viên thứ ${member.guild.memberCount}
         `)
         .setImage("attachment://image.png")
         .setColor("Random")
         .setThumbnail(member.guild.iconURL({ dynamic: true, extension: "jpg" }) || "https://cdn.discordapp.com/emojis/687231938955837454.gif")
      ], files: [attachment] }).catch((e) => console.log(e));
      let roles = data.AutoAddRoleWel;
      if(roles) {
        for (let i = 0; i < roles.length; i++ ) {
          member.roles.add(roles[i]).then(() => {
            console.log(`Đã add role cho ${member.user.username}`);
          }).catch(() => {
            console.log("Tôi không có quyền để làm điều đó")
          });
        };
      };
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};