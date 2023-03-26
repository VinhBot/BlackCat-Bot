const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const { Database } = require("st.db");
const database = new Database("./Events/Json/defaultDatabase.json", { 
  databaseInObject: true
});
module.exports = {
  name: "setup", // Tên lệnh 
  description: "Thiết lập commands", // Mô tả lệnh
  userPerms: ["Administrator"], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "music", 
      description: "Thiết lập hệ thống âm nhạc dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "channel", 
        description: "Kênh văn bản bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.Channel,
        required: true
      }],
    },{ 
      name: "welcome_goodbye", 
      description: "Thiết lập kênh welcome, goodbye dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
          name: "welcome", 
          description: "Vui lòng chọn channel bạn muốn thiết lập kênh chào mừng", 
          type: ApplicationCommandOptionType.Channel,
          required: false
      },{
          name: "goodbye", 
          description: "Vui lòng chọn channel bạn muốn thiết lập kênh tạm biệt", 
          type: ApplicationCommandOptionType.Channel,
          required: false
      }],
    },{ 
      name: "prefix", 
      description: "Thiết lập prefix dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "newprefix", 
        description: "Prefix bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.String,
        required: true
      }],
    },{ 
      name: "default_volume", 
      description: "Thiết lập default volume dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "volume", 
        description: "số volume mà bạn muốn thiết lập (1 => 150)", 
        type: ApplicationCommandOptionType.Number,
        required: true
      }],
    },{ 
      name: "default_autoresume", 
      description: "Thiết lập default autoresume dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "settings", 
        description: "tính năng mà bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Bật", value: "1" },
          { name: "Tắt", value: "2" }
        ],
      }],
    },{ 
      name: "default_autolay", 
      description: "Thiết lập default autoplay dành cho guilds", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "settings", 
        description: "tính năng mà bạn muốn thiết lập", 
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Bật", value: "1" },
          { name: "Tắt", value: "2" }
        ],
      }],
    },
  ],
  run: async(client, interaction) => {
    let guildData = await database.get(interaction.guild.id);
    if(interaction.options.getSubcommand() === "prefix") {
       const newPrefix = interaction.options.getString("newprefix");
       guildData.setDefaultPrefix = newPrefix;
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Prefix đã được đặt thành ${newPrefix}` });
    } else if(interaction.options.getSubcommand() === "welcome_goodbye") {
       const welcome = interaction.options.getChannel("welcome");
       const goodbye = interaction.options.getChannel("goodbye");
       if(welcome) {
         guildData.setDefaultWelcomeGoodbyeData.DefaultWelcomeChannel = welcome.id;
         interaction.reply({ content: `Kênh welcome của bạn đã được đặt ở ${welcome}` });
       } else if(goodbye) {
         guildData.setDefaultWelcomeGoodbyeData.DefaultGoodbyeChannel = goodbye.id;
         interaction.reply({ content: `Kênh goodbye của bạn đã được đặt ở ${goodbye}` });
       };
       await database.set(interaction.guild.id, guildData);
    } else if(interaction.options.getSubcommand() === "default_volume") {
       const newVolume = interaction.options.getNumber("volume");
       guildData.setDefaultMusicData.DefaultVolume = newVolume;
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Volume mặc định của guilds sẽ là ${newVolume}` });
    } else if(interaction.options.getSubcommand() === "default_autoresume") {
       const settings = interaction.options.getString("settings");
       if(settings === "1") {
         guildData.setDefaultMusicData.DefaultAutoresume = Boolean(true);
       } else if(settings === "2") {
         guildData.setDefaultMusicData.DefaultAutoresume = Boolean(false);
       };
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Đã thiết lập chế độ Autoresume cho guilds thành: ${settings}` });
    } else if(interaction.options.getSubcommand() === "default_autoplay") {
       const settings = interaction.options.getString("settings");
       if(settings === "1") {
         guildData.setDefaultMusicData.DefaultAutoplay = Boolean(true);
       } else if(settings === "2") {
         guildData.setDefaultMusicData.DefaultAutoplay = Boolean(false);
       };
       await database.set(interaction.guild.id, guildData);
       return interaction.reply({ content: `Đã thiết lập chế độ autoplay cho guilds thành: ${settings}` });
    } else if(interaction.options.getSubcommand() === "music") {
      var Emojis = [`0️⃣`, `1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`, `6️⃣`, `7️⃣`, `8️⃣`, `9️⃣`, `🔟`, `🟥`,`🟧`, `🟨`, `🟩`, `🟦`, `🟪`, `🟫`];
      let channel = interaction.options.getChannel("channel");
      channel.send({ embeds: [new EmbedBuilder()
        .setColor("Random")
        .setTitle(`📃 hàng đợi của __${interaction.guild.name}__`)
        .setDescription(`**Hiện tại có __0 Bài hát__ trong Hàng đợi**`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true })),
        new EmbedBuilder()
        .setColor("Random")
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ size: 4096 }) : "https://i.pinimg.com/originals/72/97/52/729752d06f814ebfbcc9a35215e2b897.jpg")
        .setTitle(`Bắt đầu nghe nhạc, bằng cách kết nối với Kênh thoại và gửi **LIÊN KẾT BÀI HÁT** hoặc **TÊN BÀI HÁT** trong Kênh này!`)
        .setDescription(`> *Tôi hỗ trợ Youtube, Spotify, Soundcloud và các liên kết MP3 trực tiếp!*`)
      ], components: [new ActionRowBuilder().addComponents([
        new StringSelectMenuBuilder().setCustomId(`StringSelectMenuBuilder`).addOptions([`Pop`, `Strange-Fruits`, `Gaming`, `Chill`, `Rock`, `Jazz`, `Blues`, `Metal`, `Magic-Release`, `NCS | No Copyright Music`, `Default`].map((t, index) => {
            return {
              label: t.substr(0, 25),
              value: t.substr(0, 25),
              description: `Tải Danh sách phát nhạc: '${t}'`.substr(0, 50),
              emoji: Emojis[index]
            };
          }))
        ]),
        new ActionRowBuilder().addComponents([
          new ButtonBuilder().setStyle('Primary').setCustomId('Skip').setEmoji(`⏭`).setLabel(`Skip`).setDisabled(),
          new ButtonBuilder().setStyle('Danger').setCustomId("1").setEmoji(`🏠`).setLabel(`Stop`).setDisabled(),
          new ButtonBuilder().setStyle('Secondary').setCustomId('Pause').setEmoji('⏸').setLabel(`Pause`).setDisabled(),
          new ButtonBuilder().setStyle('Success').setCustomId('Autoplay').setEmoji('🔁').setLabel(`Autoplay`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Shuffle').setEmoji('🔀').setLabel(`Shuffle`).setDisabled(),
        ]),
        new ActionRowBuilder().addComponents([
          new ButtonBuilder().setStyle('Success').setCustomId('Song').setEmoji(`🔁`).setLabel(`Song`).setDisabled(),
          new ButtonBuilder().setStyle('Success').setCustomId('Queue').setEmoji(`🔂`).setLabel(`Queue`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Forward').setEmoji('⏩').setLabel(`+10 Sec`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Rewind').setEmoji('⏪').setLabel(`-10 Sec`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Lyrics').setEmoji('📝').setLabel(`Lyrics`).setDisabled(),
        ]),
      ]}).then(async(msg) => {
        guildData.setDefaultMusicData.ChannelId = channel.id;
        guildData.setDefaultMusicData.MessageId = msg.id;
        await database.set(interaction.guild.id, guildData);
        return interaction.reply({ content: `**Thiết lập thành công Hệ thống Âm nhạc trong:** <#${channel.id}>` });
      });
    };
  },
};