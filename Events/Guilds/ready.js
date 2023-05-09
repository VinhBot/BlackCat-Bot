const { theme, diaryChannel, setupMusic, welconmeGoodbyeCh, mainSettings } = require(`${process.cwd()}/Events/Dashboard/dashboard.js`);
const { setupDatabase } = require(`${process.cwd()}/Events/functions`);
const { ActivityType } = require("discord.js");
const { Database } = require("st.db");
const DBD = require("discord-dashboard");
const autoresume = new Database("./Assets/Database/autoresumeDatabase.json", { 
  databaseInObject: true
});
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});
const config = require(`${process.cwd()}/config.json`);
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
    # Kiểm tra xem guilds đã có database hay chưa.
    # và tự động tạo database khi gia nhập guild
    ========================================================*/
    client.guilds.cache.forEach(async(guilds) => { 
      const checkGuilds = await database.has(guilds.id);
      if(!checkGuilds) {
        setInterval(async function() {
          await setupDatabase(guilds);
        }, 500);
      };
    });
    /*========================================================
    # Dashboard
    ========================================================*/
    await DBD.useLicense(config.dashboard.useLicense);
    DBD.Dashboard = DBD.UpdatedClass();
    const Dashboard = new DBD.Dashboard({
      port: config.dashboard.port,
      client: config.dashboard.client,
      redirectUri: config.dashboard.redirectUri,
      domain: config.dashboard.domain,
      ownerIDs: config.dashboard.ownerIDs,
      useThemeMaintenance: true,
      useTheme404: true,
      bot: client,
      theme: theme(client, config),
      settings: [
        mainSettings(client, database, config),
        welconmeGoodbyeCh(client, database, config), 
        setupMusic(client, database, config), 
        diaryChannel(client, database, config),
      ]
    });
    Dashboard.init();
    /*========================================================
    # Autoresume
    ========================================================*/
    const autoconnect = async() => {
      const { DisTube } = require("distube");
      function delay(delayInms) {
        return new Promise((resolve) => setTimeout(() => resolve(2), delayInms));
      };
      let guilds = autoresume.keysAll();
      console.log(`Autoresume`.brightCyan + ` -Tự động tiếp tục các bài hát:`, guilds);
      if(!guilds || guilds.length == 0) return;
      for (const gId of guilds) {
        try {
          let guild = client.guilds.cache.get(gId);
          if(!guild) {
            autoresume.delete(gId);
            console.log(`Autoresume`.brightCyan + ` - Bot bị kick ra khỏi Guild`);
            continue;
          };
          let data = autoresume.get(gId);
          let voiceChannel = guild.channels.cache.get(data.voiceChannel);
          if(!voiceChannel && data.voiceChannel) voiceChannel = await guild.channels.fetch(data.voiceChannel).catch(() => {}) || false;
          if(!voiceChannel || !voiceChannel.members) {
            autoresume.delete(gId);
            console.log(`Autoresume`.brightCyan + ` - Kênh voice trống / không có người nghe / đã bị xóa`)
            continue;
          }; 
          let textChannel = guild.channels.cache.get(data.textChannel);
          if(!textChannel) textChannel = await guild.channels.fetch(data.textChannel).catch(() => {}) || false;
          if(!textChannel) {
            autoresume.delete(gId);
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
          });
          let newQueue = client.distube.getQueue(guild.id);
          for(const track of tracks.slice(1)){
            newQueue.songs.push(await makeTrack(track));
          };
          console.log(`Autoresume`.brightCyan + ` - Đã thêm ${newQueue.songs.length} vài hát vào hành đợi và bắt đầu phát ${newQueue.songs[0].name} trong ${guild.name}`);
          // ĐIỀU CHỈNH CÀI ĐẶT HÀNG ĐỢI
          await newQueue.setVolume(data.volume)
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
          autoresume.delete(newQueue.id);
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
    /*========================================================
    #
    ========================================================*/
  },
};