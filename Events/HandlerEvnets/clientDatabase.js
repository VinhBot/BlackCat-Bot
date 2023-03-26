module.exports = (client) => {
  const { Database } = require("st.db");
  
  client.createExSetup = async function(interaction) {
    const defaultDatabase = new Database("./Events/Json/defaultDatabase.json", { 
      databaseInObject: true 
    });
    if(!await defaultDatabase.has(interaction.guild.id)) {
      await defaultDatabase.set(interaction.guild.id, {
        defaultGuildName: interaction.guild.name,
        setDefaultAutoresume: true,
        setDefaultAutoplay: false,
        setDefaultVolume: 50,
        setDefaultFilters: ['bassboost', '3d'],
        setupMessageId: "",
        setupChannelId: "",
        setupDjroles: [],
        setupPrefix: "!"
      });
    };
  };
};