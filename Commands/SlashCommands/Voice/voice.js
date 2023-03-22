const { AudioPlayerStatus, joinVoiceChannel, createAudioResource, createAudioPlayer } = require("@discordjs/voice");
const { ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "voice", // Tên lệnh 
  description: "các lệnh liên quan đến kênh voice", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  options: [
    { 
      name: "sounds", 
      description: "Nghe các đoạn voice meme nổi tiếng", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "tên_sound", 
        description: "Lựa chọn tên của sounds bạn muốn nghe", 
        type: ApplicationCommandOptionType.String,
        required: true, 
        choices: [
          { name: "70 tuổi", value: "1" },
          { name: "Đệt mẹ cuộc đời", value: "2" },
        ],
      }],
    },{
      name: "create", 
      description: "Tạo kênh channel voice", 
      type: ApplicationCommandOptionType.Subcommand, 
    },
  ],
  run: async(client, interaction) => {
   if(interaction.options.getSubcommand() === "sounds") {
     const toggle = interaction.options.getString("tên_sound");
     const channel = interaction.member.voice.channel;
		 if(!channel) return interaction.reply({ content: "Bạn chưa tham gia kênh voice channel" });
     const player = createAudioPlayer();
		 const connection = joinVoiceChannel({
        channelId: channel.id,
			  guildId: interaction.guild.id,
		  	adapterCreator: interaction.guild.voiceAdapterCreator,
		 });
     connection.subscribe(player);
		 player.on(AudioPlayerStatus.Idle, () => {
			connection.destroy();
		 });
     if(toggle === "1") {
        player.play(createAudioResource(`${process.cwd()}/Events/Sounds/70tuoi.mp3`));
        interaction.reply({ content: "đang chạy sounds 70 tuổi" });
     } else if(toggle === "2") {
        interaction.reply({ content: "chỉ có 70 tuổi mới có sounds thôi khà khà" });
     };
   } else if(interaction.options.getSubcommand() === "create") {
     interaction.reply({ content: "test create" });
   };
  },
};