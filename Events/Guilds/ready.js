const { theme, welconmeGoodbyeCh } = require(`${process.cwd()}/Events/Dashboard/dashboard.js`);
const { setupDatabase } = require(`${process.cwd()}/Events/functions`);
const { ActivityType } = require("discord.js");
const DBD = require("discord-dashboard");
const { Autoresume: autoresume } = require(`${process.cwd()}/Assets/Schemas/database`);
const prefixSchema = require(`${process.cwd()}/Assets/Schemas/prefix`);
const config = require(`${process.cwd()}/config.json`);

const autoresumeHandler = (client) => {
  const autoconnect = async() => {
      const { DisTube } = require("distube");
      function delay(delayInms) {
        return new Promise((resolve) => setTimeout(() => resolve(2), delayInms));
      };
      const guilds = await autoresume.find();
      if(!guilds || guilds.length == 0) return;
      for (const gId of guilds) {
          console.log(`Autoresume`.brightCyan + ` -Tự động tiếp tục các bài hát:`, gId.guild);
          try {
            let guild = client.guilds.cache.get(gId.guild);
            if(!guild) {
             await autoresume.deleteMany({ guild: gId.guild })
              console.log(`Autoresume`.brightCyan + ` - Bot bị kick ra khỏi Guild`);
              continue;
            };
            let data = await autoresume.findOne({ guild: gId.guild });
            let voiceChannel = guild.channels.cache.get(data.voiceChannel);
            if(!voiceChannel && data.voiceChannel) voiceChannel = await guild.channels.fetch(data.voiceChannel).catch(() => {}) || false;
            if(!voiceChannel || !voiceChannel.members) {
              await autoresume.deleteMany({ guild: gId.guild });
              console.log(`Autoresume`.brightCyan + ` - Kênh voice trống / không có người nghe / đã bị xóa`)
              continue;
            }; 
            let textChannel = guild.channels.cache.get(data.textChannel);
            if(!textChannel) textChannel = await guild.channels.fetch(data.textChannel).catch(() => {}) || false;
            if(!textChannel) {
              await autoresume.deleteMany({ guild: gId.guild });
              console.log(`Autoresume`.brightCyan + ` - Kênh văn bản đã bị xóa`);
              continue;
            };
            let tracks = data.songs;
            if(!tracks || !tracks[0]) {
              console.log(`Autoresume`.brightCyan + ` - Đã hủy trình phát, vì không có bản nhạc nào`);
              continue;
            };
            const makeTrack = async(track) => {
              return new DisTube.Song(new DisTube.ISearchResult({
                duration: track.duration,
                formattedDuration: track.formattedDuration,
                id: track.id,
                isLive: track.isLive,
                name: track.name,
                thumbnail: track.thumbnail,
                type: "video",
                uploader: track.uploader,
                url: track.url,
                views: track.views,              
              }), guild.members.cache.get(track.memberId) || guild.me, track.source);
            };
          await client.distube.play(voiceChannel, tracks[0].url, {
            member: guild.members.cache.get(tracks[0].memberId) || guild.me,
            textChannel: textChannel
          }).catch((ex) => { });
          let newQueue = client.distube.getQueue(guild.id);
          for(const track of tracks.slice(1)){
            newQueue.songs.push(await makeTrack(track));
          };
          console.log(`Autoresume`.brightCyan + ` - Đã thêm ${newQueue.songs.length} vài hát vào hành đợi và bắt đầu phát ${newQueue.songs[0].name} trong ${guild.name}`);
          // ĐIỀU CHỈNH CÀI ĐẶT HÀNG ĐỢI
          await newQueue.setVolume(data.volume);
          if(data.repeatMode && data.repeatMode !== 0) {
            newQueue.setRepeatMode(data.repeatMode);
          };
          if(!data.playing) {
            newQueue.pause();
          };
          await newQueue.seek(data.currentTime);
          if(data.filters && data.filters.length > 0){
            await newQueue.filters.set(data.filters, true);
          };
          await autoresume.deleteMany({ guild: newQueue.id }).then(() => {
            return console.log("Đã xoá thành công")
          });
          console.log(`Autoresume`.brightCyan + " - Đã thay đổi theo dõi autoresume để điều chỉnh hàng đợi + đã xóa mục nhập cơ sở dữ liệu");
          if(!data.playing) {
            newQueue.pause();
          };
          await delay(1000);
        } catch(e) {
          console.log(e);
        };
      };
  }; 
  setTimeout(() =>  autoconnect(), 2 * client.ws.ping);
};

const dashboard = async(client, options) => {
  if(options) {
    const botClient = {
      id: process.env.botID,
      secret: process.env.botSecret
    };
    const redirectUri = process.env.redirectUri;
    await DBD.useLicense(config.dashboard.useLicense);
    DBD.Dashboard = DBD.UpdatedClass();
    const Dashboard = new DBD.Dashboard({
      port: config.dashboard.port,
      client: botClient || config.dashboard.client,
      redirectUri: redirectUri || config.dashboard.redirectUri,
      domain: config.dashboard.domain,
      ownerIDs: config.dashboard.ownerIDs,
      useThemeMaintenance: true,
      useTheme404: true,
      bot: client,
      theme: theme(client, config),
      settings: [
        welconmeGoodbyeCh(client, config), 
      ]
    });
    return Dashboard.init();
  };
};
    
module.exports = {
	eventName: "ready", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client) => {
    /*========================================================
    # Xem bot đã online hay chưa
    ========================================================*/
    console.log(`${client.user.username} đã sẵn sàng hoạt động`.red); 
    const setActivities = [ 
      `${client.guilds.cache.size} Guilds, ${client.guilds.cache.map(c => c.memberCount).filter(v => typeof v === "number").reduce((a, b) => a + b, 0)} member`,
      `BlackCat-Club`
    ];
    setInterval(() => {
      client.user.setPresence({
        activities: [{ name: setActivities[Math.floor(Math.random() * setActivities.length)], type: ActivityType.Playing }],
        status: 'dnd',
      });
    }, 5000);
    /*========================================================
    # Dashboard
    ========================================================*/
    dashboard(client, false);
    /*========================================================
    # Autoresume
    ========================================================*/
    autoresumeHandler(client);
  },
};