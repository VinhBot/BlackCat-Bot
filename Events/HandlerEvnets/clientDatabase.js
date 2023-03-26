module.exports = (client) => {
  const { Database } = require("st.db");
  
  client.createExSetup = async function(interaction) {
    const defaultDatabase = new Database("./Events/Json/defaultDatabase.json", { 
      databaseInObject: true 
    });
    if(!await defaultDatabase.has(interaction.guild.id)) { // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
      await defaultDatabase.set(interaction.guild.id, { // nếu chưa có thì nhập guilds vào cơ sở dữ liệu
        defaultGuildName: interaction.guild.name,   // tên guilds
        setDefaultPrefix: "!", // đặt prefix mặc định cho guild
        setDefaultMusicData: {                      // thiết lập mặc định dành cho hệ thống âm nhạc
          DefaultAutoresume: true,               // 1
          DefaultAutoplay: false,                // 2
          DefaultVolume: 50,                     // 3
          DefaultFilters: ['bassboost', '3d'],   // 4
          MessageId: "",                         // 5
          ChannelId: "",                         // 6
          Djroles: [],                           // 7                  
        }                         
      });
    };
  };
};