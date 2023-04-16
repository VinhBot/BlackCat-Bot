const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const { setupDatabase, ticketHandler, EconomyHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});

module.exports = async(client) => {
  /*========================================================
  # EconomyHandler
  ========================================================*/
  client.cs = new EconomyHandler({
    EcoPath: "./Assets/Database/economyDatabase.json",
    setFormat: ["vi-VN", "VND"], // xác định loại tiền của các nước
    // Đặt số tiền ngân hàng mặc định khi người dùng mới được tạo!
    setDefaultWalletAmount: 10000, // trong ví tiền
    setDefaultBankAmount: 10000, // trong ngân hàng
    setMaxWalletAmount: 10000,// Đặt số lượng tiền trong ví tiền tối đa mặc định mà người dùng có thể có! ở đây 0 có nghĩa là vô hạn.
    setMaxBankAmount: 0, // Giới hạn dung lượng ngân hàng của nó ở đây 0 có nghĩa là vô hạn.
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
  # AutoCreate Voice 
  ========================================================*/
  client.on("voiceStateUpdate", async(oldState, newState) => {
    const channelIdData = await database.get(oldState.guild.id);
    const guild = client.guilds.cache.get(oldState.guild.id);
    const ChannelId = guild.channels.cache.get(channelIdData.setDefaultMusicData.ChannelAutoCreateVoice);
    if(newState?.channelId === ChannelId.id) {
      // Khi người dùng kết nối với kênh trung tâm voice, hãy tạo một kênh voice duy nhất có quyền
      guild.channels.create({
        name: `🔊 ${newState?.member?.displayName}`,
        type: ChannelType.GuildVoice,
        parent: newState.channel.parent,
        permissionOverwrites: [{
          id: client.user.id,
          allow: ['Connect', 'ViewChannel', 'ManageChannels', 'MoveMembers']
        },{
          id: guild.id,
          allow: ['Connect'],
        }]
      }).then((newVoiceChannel) => {
        // Không cho phép người dùng tham gia lại kênh trung tâm. Điều này ngăn việc tạo nhiều kênh voice
        ChannelId.permissionOverwrites.edit(newState?.member, {
          Connect: false
        });
        // Chuyển người dùng sang kênh voice mới
        newState.member.voice.setChannel(newVoiceChannel);
      });
    } else if(newState?.channelId === null) {
      // Tìm nạp và lọc các kênh voice để xem có ai trong đó không
      const fetchedChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice && channel.id !== ChannelId.id && channel.members.size < 1);
      // Xóa tất cả các kênh voice đã lọc
      for (const channel of fetchedChannels.values()) {
        channel.delete();
      };
      // Cho phép người dùng tham gia lại voice
      ChannelId.permissionOverwrites.delete(newState?.member);
    };
  });
  /*========================================================
  # autoresponse
  ========================================================*/
  client.on("messageCreate", async(message) => {
    if(message.author.bot || !message.guild) return;
    const autoresponsedata = new Database("./Assets/Database/autoresponse.json", { 
      databaseInObject: true 
    });
    const checkData = await autoresponsedata.has(message.guild.id);
    if(!checkData) {
      await autoresponsedata.set(message.guild.id, [
          { name: "", wildcard: "", responses: "" }
      ]); 
    };
    const data = await autoresponsedata.get(message.guild.id);
    if(!data) return;
    if(data) {
      if(data.some((data) => message.cleanContent.includes(data.name) && data.wildcard || data.name == message.cleanContent && !data.wildcard)) {
         let response = data.find((data) => message.cleanContent.includes(data.name) && data.wildcard || data.name == message.cleanContent && !data.wildcard);
         return message.reply({ 
           content: `${response.responses}`
         }).catch((ex) => {});
      };
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