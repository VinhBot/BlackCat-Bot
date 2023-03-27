const { AttachmentBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require("discord.js");
const { join } = require('node:path');
const Canvas = require('canvas');
const axios = require('axios');
const { Database } = require("st.db");
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Events/Json/defaultDatabase.json", { 
  databaseInObject: true 
});

const profile = {
  "badges": [
    "https://cdn.discordapp.com/attachments/869133321010032731/889041954296430642/brilliance.png",
    "https://cdn.discordapp.com/attachments/869133321010032731/889033855720390686/blance.png",
    "https://cdn.discordapp.com/attachments/869133321010032731/889033856852828220/bravery.png"
  ],
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

module.exports = (client) => {
  /*========================================================
  # Kiểm tra xem guilds đã có database hay chưa 
  ========================================================*/
  client.on("messageCreate", async(message) => {
    if(message.author.bot || !message.guild) return;
    // kiểm tra xem guilds có database hay chưa, nếu chưa thì thiết lập chúng.
    if(!await database.has(message.guild.id)) {  // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
      await database.set(message.guild.id, {     // nếu chưa có thì nhập guilds vào cơ sở dữ liệu
        defaultGuildName: message.guild.name,    // tên guilds
        setDefaultPrefix: config.prefix,         // đặt prefix mặc định cho guild
        setDefaultMusicData: {                   // thiết lập mặc định dành cho hệ thống âm nhạc
          DefaultAutoresume: true,               // 1: chế độ mặc định tự đông phát lại nhạc bot gặp sự cố
          DefaultAutoplay: false,                // 2: chế độ tự động phát nhạc khi kết thúc bài hát
          DefaultVolume: 50,                     // 3: cài đặt âm lượng mặc định cho guild
          DefaultFilters: ['bassboost', '3d'],   // 4: cài đặt filters mặc định cho guils
          MessageId: "",                         // 5: thiết lập id tin nhắn 
          ChannelId: "",                         // 6: thiết lập channelid
          Djroles: [],                           // 7: thiết lập role chuyên nhạc                  
        },
        setDefaultWelcomeGoodbyeData: {          // xet welcome, googbye, 
          DefaultWelcomeChannel: "",
          DefaultGoodbyeChannel: "",
        },
      });
    };
  });
  /*========================================================
  # tự động tạo database khi gia nhập guild
  ========================================================*/
  client.on('guildCreate', async(guild) => {
    // kiểm tra xem guilds có database hay chưa, nếu chưa thì thiết lập chúng.
    if(!await database.has(guild.id)) {          // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
      await database.set(guild.id, {             // nếu chưa có thì nhập guilds vào cơ sở dữ liệu
        defaultGuildName: guild.name,            // tên guilds
        setDefaultPrefix: config.prefix,         // đặt prefix mặc định cho guild
        setDefaultMusicData: {                   // thiết lập mặc định dành cho hệ thống âm nhạc
          DefaultAutoresume: true,               // 1: chế độ mặc định tự đông phát lại nhạc bot gặp sự cố
          DefaultAutoplay: false,                // 2: chế độ tự động phát nhạc khi kết thúc bài hát
          DefaultVolume: 50,                     // 3: cài đặt âm lượng mặc định cho guild
          DefaultFilters: ['bassboost', '3d'],   // 4: cài đặt filters mặc định cho guils
          MessageId: "",                         // 5: thiết lập id tin nhắn 
          ChannelId: "",                         // 6: thiết lập channelid
          Djroles: [],                           // 7: thiết lập role chuyên nhạc                  
        },
        setDefaultWelcomeGoodbyeData: {          // xet welcome, googbye, 
          DefaultWelcomeChannel: "",
          DefaultGoodbyeChannel: "",
        },
      });
    };
    // Tin nhắn gửi đến channel mà bot có thể gửi. :)) 
    guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText).send({ 
      embeds: [new EmbedBuilder()
        .setDescription('Hi')
        .setColor('Blue')
      ]
    });
  });
  client.on('guildDelete', async(guild) => {
    // xoá database khi bot rời khỏi guilds
    await database.delete(guild.id);
  });
  /*========================================================
  ========================================================*/
const Badges = {
  "BUGHUNTER_LEVEL_1": {
		name: 'Discord Bug Hunter',
		url: 'https://cdn.discordapp.com/emojis/604997907095093248.png?v=1',
	},
	"BUGHUNTER_LEVEL_2": {
		name: 'Discord Bug Hunter',
		url: 'https://cdn.discordapp.com/emojis/657002233556107264.png?v=1',
	},
	"DISCORD_EMPLOYEE": {
		name: 'Discord Staff',
		url: 'https://cdn.discordapp.com/emojis/843414316202983435.png?v=1',
	},
	"DISCORD_NITRO": {
		name: 'Discord Nitro',
		url: 'https://cdn.discordapp.com/emojis/314068430611415041.png?v=1',
	},
	"EARLY_SUPPORTER": {
		name: 'Early Supporter',
		url: 'https://cdn.discordapp.com/emojis/720584849832017920.png?v=1',
	},
	"HOUSE_BALANCE": {
		name: 'HypeSquad Balance',
		url: 'https://cdn.discordapp.com/emojis/640336405431713802.png?v=1',
	},
	"HOUSE_BRAVERY": {
		name: 'HypeSquad Bravery',
		url: 'https://cdn.discordapp.com/emojis/640336405079392319.png?v=1',
	},
	"HOUSE_BRILLIANCE": {
		name: 'HypeSquad Brilliance',
		url: 'https://cdn.discordapp.com/emojis/640336405377187842.png?v=1',
	},
	"HYPESQUAD_EVENTS": {
		name: 'HypeSquad Events',
		url: 'https://cdn.discordapp.com/emojis/604997907053281300.png?v=1',
	},
	"EARLY_VERIFIED_BOT_DEVELOPER": {
		name: 'Early Verified Bot Developer',
		url: 'https://cdn.discordapp.com/emojis/720584852063387719.png?v=1',
	},
	"PARTNERED_SERVER_OWNER": {
		name: 'Partnered Server Owner',
		url: 'https://cdn.discordapp.com/emojis/843414316509954059.png?v=1',
	},
	"DISCORD_CERTIFIED_MODERATOR": {
		name: 'Discord Certified Moderator',
		url: 'https://cdn.discordapp.com/emojis/848270498747645972.png?v=1',
  }
};
  // gởi tin nhắn lhi có member gia nhập guilds//
  client.on('messageCreate', async(message) => {
    if(message.content === "badges") {
      const flagToBadgeName = {
        "HOUSE_BALANCE": "Hypesquad Balance",
        "HOUSE_BRILLIANCE": "Hypesquad Brillance",
        "HOUSE_BRAVERY": "Hypesquad Bravery",
        "VERIFIED_BOT": "Verified Bot"
      };
      const badges = message.member.flags.toArray().map((flag) => flagToBadgeName[flag]).filter((name) => name !== undefined);
      message.reply({ content: `badges: ${badges}` }).catch((e) => console.log(e));
    };
    if(message.content === "!we") {
      const member = message.member;
      const { setDefaultWelcomeGoodbyeData: data } = await database.get(member.guild.id);
      const channel = member.guild.channels.cache.find(c => c.id === data.DefaultWelcomeChannel);
      if(!channel) return;
      Canvas.registerFont(join(__dirname, '..', '..', 'HelveticaNeue.otf'), { family: 'HelveticaNeue', weight: "regular", style: "normal" });
      Canvas.registerFont(join(__dirname, '..', '..', 'HelveticaNeue-Bold.otf'), { family: 'HelveticaNeueBold', weight: "regular", style: "normal" });
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
  
      const mathrd = profile.badges[Math.floor(Math.random() * profile.badges.length)]
      const badge_6 = await Canvas.loadImage(mathrd);
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
      channel.send({ embeds: [new EmbedBuilder()
         .setTitle("Welcome " + member.user.username)
         .setDescription(`
🏤 chào mừng <@${member.user.id}> đã đến với ${member.guild.name} 
📝 xin vui lòng xem qua luật tại <#1089119081304707102>

🌟 Chúc bạn có những giây phút vui vẻ và thoải mái tại ${member.guild.name} cảm ơn.
        
🤔 bạn là thành viên thứ ${member.guild.memberCount}

🐸 

         `)
         .setImage("attachment://image.png")
         .setColor("Random")
         .setThumbnail(member.guild.iconURL({ dynamic: true, extension: "jpg" }) || "https://cdn.discordapp.com/emojis/687231938955837454.gif")
      ], files: [attachment]  }).catch((e) => console.log(e));
    };
  });


  client.on("guildMemberAdd", async(member) => {
      const { setDefaultWelcomeGoodbyeData: data } = await database.get(member.guild.id);
      const channel = member.guild.channels.cache.find(c => c.id === data.DefaultWelcomeChannel);
      if(!channel) return;
      Canvas.registerFont(join(__dirname, '..', '..', 'HelveticaNeue.otf'), { family: 'HelveticaNeue', weight: "regular", style: "normal" });
      Canvas.registerFont(join(__dirname, '..', '..', 'HelveticaNeue-Bold.otf'), { family: 'HelveticaNeueBold', weight: "regular", style: "normal" });
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
  
      const mathrd = profile.badges[Math.floor(Math.random() * profile.badges.length)]
      const badge_6 = await Canvas.loadImage(mathrd);
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
      channel.send({ embeds: [new EmbedBuilder()
         .setTitle("Welcome " + member.user.username)
         .setDescription(`
🏤 chào mừng <@${member.user.id}> đã đến với ${member.guild.name} 
📝 xin vui lòng xem qua luật tại <#1089119081304707102>

🌟 Chúc bạn có những giây phút vui vẻ và thoải mái tại ${member.guild.name} cảm ơn.
        
🤔 bạn là thành viên thứ ${member.guild.memberCount}

🐸 

         `)
         .setImage("attachment://image.png")
         .setColor("Random")
         .setThumbnail(member.guild.iconURL({ dynamic: true, extension: "jpg" }) || "https://cdn.discordapp.com/emojis/687231938955837454.gif")
      ], files: [attachment]  }).catch((e) => console.log(e));
  });
  // gửi tin nhắn khi nember rời khỏi guilds
  client.on('guildMemberRemove', async(member) => {
    const { setDefaultWelcomeGoodbyeData: data } = await database.get(member.guild.id);
    const channel = member.guild.channels.cache.find(c => c.id === data.DefaultGoodbyeChannel);
    if(!channel) return;
    const canvas = Canvas.createCanvas(1772, 633);     
    const ctx = canvas.getContext('2d');     
    const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/1055150050357022843/1089624908570566836/welcome.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f2f2f2';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    var textString3 = `${member.user.username}`;
    if (textString3.length >= 14) {
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
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'goodbye-image.png' }); 
    channel.send({ files: [attachment] }); 
  });
};