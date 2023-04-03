const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const { setupDatabase, ticketHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});

module.exports = async(client) => {
  /*========================================================
  # kiểm tra và thêm data cho user
  ========================================================*/
  client.on("ready", () => {
    const userData = new Database("./Assets/Database/defaultUserData.json", { 
      databaseInObject: true 
    });
    // tìm kiếm và nhập user từ các sv
    client.users.cache.forEach(async(user) => { 
       if(!await userData.has(user.id) !== user.bot) {          // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
         console.log(`Đã tạo database cho: ${user.username}`); // thông báo ra bảng điều khiển
         setInterval(async function() {
           await userData.set(user.id, {             // nếu chưa có thì nhập guilds vào cơ sở dữ liệu
             Name: user.username, // tên
             Age: "", // tuổi
             Actors: "", // diễn viên
             Artists: "", // nghệ sĩ
             Gender: "", // giới tính
             Birthday: "", // sinh nhật
             Color: "", // màu
             Pets: "", // thú cưng
             Food: "", // đồ ăn
             Songs: "", // bài hát
             Movies: "", // phim
             Status: "", // trạng thái
             Aboutme: "", // thông tin
             Orgin: "", // quê quán
             Game: "", // game yêu thích
             Flags: "", // huy hiệu của bot
           });
         }, 10000);
      };
    });
  });
  /*========================================================
  # interactionCreate.js
  ========================================================*/
  client.on("interactionCreate", async(interaction) => {
    const { customId } = interaction;
    if(interaction.isButton()) {
      if(customId === "inviteBot") {
        interaction.reply({ content: `[Bấm vào đây](${config.discordBot})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      } else if(customId === "inviteDiscord") {
        interaction.reply({ content: `[Bấm vào đây](${config.discord})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      };
      /*========================================================
      # ticket handlers 🎫 🎟️
      ========================================================*/
      const { handleTicketOpen, handleTicketClose } = new ticketHandler();
      if(customId === "TicketCreate") {
        return handleTicketOpen(interaction);
      } else if(customId === "TicketClose") {
        return handleTicketClose(interaction);
      };
      /*========================================================
      # 
      ========================================================*/
    } else if(interaction.isStringSelectMenu()) {
      // help
    };
  });
  /*========================================================
  # guildCreate.js 👻
  ========================================================*/
  client.on("guildCreate", async(guild) => {
    // tạo database cho guil khi gia nhập
    await setupDatabase(guild);
    // Tin nhắn gửi đến channel mà bot có thể gửi. :)) 
    const inviteBot = new ButtonBuilder().setCustomId('inviteBot').setLabel('Mời bot').setStyle("Primary").setEmoji('🗿');
    const Discord = new ButtonBuilder().setCustomId('inviteDiscord').setLabel('Vào Discord').setStyle("Primary").setEmoji('🏡');
    guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText).send({ 
      embeds: [new EmbedBuilder()
        .setAuthor({ name: guild.name, url: "https://discord.gg/tSTY36dPWa" })
        .setThumbnail("https://i.pinimg.com/originals/3f/2c/10/3f2c1007b4c8d3de7d4ea81b61008ca1.gif")
        .setColor("Random")
        .setTimestamp()
        .setDescription(`✨ ${config.prefix}help để xem tất cả các lệnh`)
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      ], components: [new ActionRowBuilder().addComponents([ inviteBot, Discord ])]
    }).catch((e) => console.log(`guildCreate: ${e}`));
  });
  /*========================================================
  # guildDelete.js ☠️
  ========================================================*/
  client.on("guildDelete", async(guild) => {
    // xoá database khi bot rời khỏi guilds
    await database.delete(guild.id);
  });
  /*========================================================
  # 
  ========================================================*/
};