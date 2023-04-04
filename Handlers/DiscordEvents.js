const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const { setupDatabase, ticketHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});

module.exports = async(client) => {
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
    const guild = client.guilds.cache.get("1055150050357022840");
    const ChannelId = guild.channels.cache.get("1055150050357022844");
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