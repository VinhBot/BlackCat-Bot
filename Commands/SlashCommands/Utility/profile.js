const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const database = new Database("./Assets/Database/defaultUserData.json", { 
  databaseInObject: true 
});
module.exports = {
  name: "about", // Tên lệnh 
  description: "Thiết lập giới thiệu cho bản thân", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    {
      
    },{ 
      name: "profile", 
      description: "xem thông tin của bạn hoặc thành viên trong guild", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "user", 
        description: "Bạn muốn xem thông tin của ai nào", 
        type: ApplicationCommandOptionType.User,
        required: true
      }],
    },{
      name: "add", 
      description: "Thiết lập thông tin của bạn", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "diễn_viên", 
          description: "Thêm diễn viên ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "nghệ_sĩ", 
          description: "Thêm nghệ sĩ ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "đồ_ăn", 
          description: "Thêm đồ ăn ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "game", 
          description: "Thêm tụa game ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "phim", 
          description: "Thêm tên phim ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "thú_cưng", 
          description: "Thêm thú cưng ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "bài_hát", 
          description: "Thêm bài hát ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "độ_tuổi", 
          description: "Thêm độ tuổi của bạn", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "sinh_nhật", 
          description: "Thêm ngày tháng năm sinh của bạn", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "màu_sắc", 
          description: "Thêm màu sắc ưa thích", 
          type: ApplicationCommandOptionType.String,
          required: false
        },{
          name: "giới_tính", 
          description: "Thêm giới tính của bạn", 
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            { name: "👦 Nam", value: "nam" },
            { name: "👧 Nữ", value: "nu" },
            { name: "👪 khác", value: "khac" },
          ]
        },{
          name: "trạng_thái", 
          description: "Thêm trạng thái của bạn", 
          type: ApplicationCommandOptionType.String,
          required: false
        }
      ],
    },
  ],
  run: async(client, interaction) => {
     if(interaction.options.getSubcommand() === "create") {
       const checkData = await database.has(interaction.user.id) 
       if(!checkData) {          // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
         console.log(`Đã tạo database cho: ${interaction.user.username}`); // thông báo ra bảng điều khiển
         setInterval(async function() {
           await database.set(interaction.user.id, {             // nếu chưa có thì nhập guilds vào cơ sở dữ liệu
             Name: interaction.user.username, // tên
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
         return interaction.reply({ content: `Đã tạo database cho ${interaction.user.username}` });
       };
       if(checkData) return interaction.reply({ content: "Bạn đã có trong hệ thống database" });
     } else if(interaction.options.getSubcommand() === "add") {
       const data = await database.get(interaction.user.id);
       const actors = interaction.options.getString('diễn_viên');
       const artist = interaction.options.getString('nghệ_sĩ');
       const food = interaction.options.getString('đồ_ăn');
       const game = interaction.options.getString('game');
       const movie = interaction.options.getString('phim');
       const pet = interaction.options.getString('thú_cưng');
       const songs = interaction.options.getString('bài_hát');
       const age = interaction.options.getString('độ_tuổi');
       const birthday = interaction.options.getString('sinh_nhật');
       const color = interaction.options.getString('màu_sắc');
       const gender = interaction.options.getString('giới_tính');
       const status = interaction.options.getString('trạng_thái');
       let response;
       if(actors) {
         data.Actors = actors;
         response = `Đã cập nhật diễn viên yêu thích là: ${actors}`;
       } else if(artist) {
         data.Artists = artist;
         response = `Đã cập nhật nghệ sĩ yêu thích là: ${artist}`;
       } else if(food) {
         data.Food = food;
         response = `Đã cập nhật đồ ăn yêu thích là: ${food}`;
       } else if(game) {
         data.Game = game;
         response = `Đã cập nhật tựa game yêu thích là: ${game}`;
       } else if(movie) {
         data.Movies = movie;
         response = `Đã cập nhật phim yêu thích là: ${movie}`;
       } else if(pet) {
         data.Pets = pet;
         response = `Đã cập nhật thú cưng yêu thích là: ${pet}`;
       } else if(songs) {
         data.Songs = songs;
         response = `Đã cập nhật bài hát yêu thích là: ${songs}`;
       } else if(age) {
         data.Age = age;
         response = `Đã cập nhật độ tuổi của bạn thành: ${artist}`;
       } else if(birthday) {
         const split = birthday.trim().split("/");
         let [day, month] = split;
         if(!day || !month) return interaction.reply({ content: "Vui lòng thiết lập theo [ngày]/[tháng]"})
         if(isNaN(day) || isNaN(month)) return interaction.reply({ content: "Ngày bạn đưa ra không phải là một số hợp lệ" });
         day = parseInt(day);
         month = parseInt(month);
         if(!day || day > 31) return interaction.reply({ error: "Định dạng ngày sai!" });
         if(!month || month > 12) return interaction.reply({ error: "Định dạng tháng sai!" });
         const bday = `${day}/${month}`;
         if(data === data.Birthday) {
           data.Birthday = bday;
           response = `Đã cập nhật sinh nhật của bạn thành: ${bday}`;
         };
       } else if(color) {
         data.Color = color;
         response = `Đã cập nhật màu sắc của bạn thành: ${color}`;
       } else if(gender) {
         if(gender === "nam") {
           data.Gender = "Nam";
           var reslut = "Nam";
         } else if(gender === "nu") {
           data.Gender = "Nữ";
           var reslut = "Nữ";
         } else if(reslut === "khac") {
           data.Gender = "Khác";
           var reslut = "Khác";
         };
         response = `Đã cập nhật độ tuổi của bạn thành: ${reslut}`;
       } else if(status) {
         data.Status = status;
         response = `Đã cập nhật trạng thái của bạn thành: ${status}`;
       };
       await database.set(interaction.user.id, data);
       return interaction.reply({ content: `✨ ${response} ` })
     } else if(interaction.options.getSubcommand() === "profile") {
       const user = interaction.options.getUser('user');
       const data = await database.get(user.id);
       if(data) {
         const flags = {
           ActiveDeveloper: "👨‍💻・Active Developer",
           BugHunterLevel1: "🐛・Discord Bug Hunter",
           BugHunterLevel2: "🐛・Discord Bug Hunter",
           CertifiedModerator: "👮‍♂️・Certified Moderator",
           HypeSquadOnlineHouse1: "🏠・House Bravery Member",
           HypeSquadOnlineHouse2: "🏠・House Brilliance Member",
           HypeSquadOnlineHouse3: "🏠・House Balance Member",
           HypeSquadEvents: "🏠・HypeSquad Events",
           PremiumEarlySupporter: "👑・Early Supporter",
           Partner: "👑・Partner",
           Quarantined: "🔒・Quarantined",
           Spammer: "🔒・Spammer",
           Staff: "👨‍💼・Discord Staff",
           TeamPseudoUser: "👨‍💼・Discord Team",
           VerifiedBot: "🤖・Verified Bot",
           VerifiedDeveloper: "👨‍💻・(early)Verified Bot Developer",
        };
        const userFlags = user.flags ? user.flags.toArray() : [];
        return interaction.reply({
           embeds: [new EmbedBuilder() 
             .setTitle(`Profile của ${client.user.username}`)
             .setDescription("__________")
             .setThumbnail(user.avatarURL({ dynamic: true }))
             .addFields(
               { name: "🕵️┆ Tên thành viên", value: user.username, inline: true },
               { name: "📠┆ Số định danh", value: user.discriminator, inline: true },
               { name: "🆔┆ ID thành viên", value: user.id, inline: true },
               { name: "👫┆ Giới tính", value: `${data.Gender || 'Chưa cập nhật'}`, inline: true },
               { name: "🔢┆ Độ tuổi", value: `${data.Age || 'Chưa cập nhật'}`, inline: true },
               { name: "🎂┆ Ngày sinh nhật", value: `${data.Birthday || 'Chưa cập nhật'}`, inline: true },
               { name: "🎨┆ Màu sắc yêu thích", value: `${data.Color || 'Chưa cập nhật'}`, inline: true },
               { name: "🐶┆ vật nuôi yêu thích", value: `${data.Pets ? data.Pets : 'Chưa cập nhật'}`, inline: true },
               { name: "🍕┆ Đồ ăn yêu thích", value: `${data.Food ? data.Food : 'Chưa cập nhật'}`, inline: true },
               { name: "🎶┆ Bài hát yêu thích", value: `${data.Songs ? data.Songs : 'Chưa cập nhật'}`, inline: true },
               { name: "🎤┆ Nghệ sĩ yêu thích", value: `${data.Artists ? data.Artists : 'Chưa cập nhật'}`, inline: true },
               { name: "🎬┆ Bộ phim yêu thích", value: `${data.Movies ? data.Movies : 'Chưa cập nhật'}`, inline: true },
               { name: "👨‍🎤┆ Diễn viên yêu thích", value: `${data.Actors ? data.Actors : 'Chưa cập nhật'}`, inline: true },
               { name: "🏴┆ Quê quán", value: `${data.Orgin || 'Chưa cập nhật'}`, inline: true },
               { name: "🎮┆ Tựa game yêu thích", value: `${data.Game ? data.Game : 'Chưa cập nhật'}`, inline: true },
               { name: "✨┆ Trạng thái", value: `${data.Status || 'Chưa cập nhật'}`, inline: true },
               { name: "👨‍💻┆ Huy hiệu bot", value: `${data.Flags ? data.Flags : "Không có"}`, inline: true },
               { name: "🧧┆ Huy hiệu Discord", value: `${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Không có' || 'Không có'}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: user.username, iconURL: user.avatarURL({ dynamic: true }) })]
        }).catch((e) => console.log(e));
      } else return interaction.reply({
           content: "Không tìm thấy profile của bạn"
      });
    };
  },
};