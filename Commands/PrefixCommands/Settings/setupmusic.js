const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const path = require("node:path");
const { Database } = require("st.db");
const database = new Database("./Events/Json/defaultDatabase.json", { 
  databaseInObject: true
});
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["sums", "setupdefaultmusic"], // lệnh phụ
  description: "Thiết lập hệ thống âm nhạc cho channel", // mô tả lệnh
  userPerms: ["Administrator"], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Settings", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    var Emojis = [`0️⃣`, `1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`, `6️⃣`, `7️⃣`, `8️⃣`, `9️⃣`, `🔟`, `🟥`,`🟧`, `🟨`, `🟩`, `🟦`, `🟪`, `🟫`];
    let channel = message.mentions.channels.first();
    if(!channel) return message.reply({ content: `**Bạn quên ping một Text-Channel!**` });
    channel.send({ embeds: [new EmbedBuilder()
        .setColor("Random")
        .setTitle(`📃 hàng đợi của __${message.guild.name}__`)
        .setDescription(`**Hiện tại có __0 Bài hát__ trong Hàng đợi**`)
        .setThumbnail(message.guild.iconURL({ dynamic: true })),
        new EmbedBuilder()
        .setColor("Random")
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setImage(message.guild.banner ? message.guild.bannerURL({ size: 4096 }) : "https://i.pinimg.com/originals/72/97/52/729752d06f814ebfbcc9a35215e2b897.jpg")
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
        const guildData = await database.get(message.guild.id);
        // Cập nhật thuộc tính setDefaultVolume với giá trị mới
        guildData.setDefaultMusicData.setupChannelId = channel.id;
        guildData.setDefaultMusicData.setupMessageId = msg.id;
        // thiết lập thuộc tính với giá trị mới
        await database.set(message.guild.id, guildData);
        return message.reply({ content: ` **Thiết lập thành công Hệ thống Âm nhạc trong:** <#${channel.id}>` });
    });
  },
};