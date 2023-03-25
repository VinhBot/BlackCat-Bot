module.exports = (client) => {
  const { Database } = require("st.db");
  client.createExSetup = async function(interaction) {
    const db = new Database("./Events/Json/defaultDatabase.json", { 
      databaseInObject: true 
    });
    const database = await db.has(interaction.guild.id);
    if(!database) {
      await db.set(interaction.guild.id, {
        defaultGuildName: interaction.guild.name,
        setDefaultAutoplay: false,
        setDefaultVolume: 50,
        setAutoresume: true,
        setupMessageId: "",
        setupChannelId: ""
      });
    };
  };

  client.createSetup = async function(interaction, channel, message) {
    const database = new Database("./Events/Json/defaultDatabase.json", { 
      databaseInObject: true
    });
    await database.set(interaction.guild.id, {
      defaultGuildName: interaction.guild.name,
      setDefaultAutoplay: false,
      setDefaultVolume: 50,
      setAutoresume: true,
      setupMessageId: message,
      setupChannelId: channel 
    });
  };
};