module.exports = (client) => {
  const { Database } = require("st.db");
  
  client.createExSetup = async function(interaction) {
    const defaultDatabase = new Database("./Events/Json/defaultDatabase.json", { 
      databaseInObject: true 
    });
    if(!await defaultDatabase.has(interaction.guild.id)) { // kiểm tra xem guilds đã có trong cơ sở dữ liệu hay là chưa 
      await defaultDatabase.set(interaction.guild.id, { // nếu chưa có thì nhập guilds vào cơ sở dữ liệu
        defaultGuildName: interaction.guild.name,   // tên guilds
        setDefaultMusicData: {                      // thiết lập mặc định dành cho hệ thống âm nhạc
          setDefaultAutoresume: true,               // 1
          setDefaultAutoplay: false,                // 2
          setDefaultVolume: 50,                     // 3
          setDefaultFilters: ['bassboost', '3d'],   // 4
          setupMessageId: "",                       // 5
          setupChannelId: "",                       // 6
          setupDjroles: [],                         // 7                  
        },
        setupPrefix: "!"                         
      });
    };
  };
};