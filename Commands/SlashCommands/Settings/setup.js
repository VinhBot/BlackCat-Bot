const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
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
    },
  ],
  run: async(client, interaction) => {
     if(interaction.options.getSubcommand() === "music") {
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
        await client.createSetup(interaction, channel.id, msg.id);
        return interaction.reply({ content: ` **Thiết lập thành công Hệ thống Âm nhạc trong:** <#${channel.id}>` });
      });
    };
  },
};