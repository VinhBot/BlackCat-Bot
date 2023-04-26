const { ChannelType } = require("discord.js");
const DBD = require("discord-dashboard");
const { Database } = require("st.db");
const theme = require("./theme.js");
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true,
});
const BotFilters = {
  "3d": "3d",
  "bassboost": "bassboost",
  "echo": "echo",
  "karaoke": "karaoke",
  "nightcore": "nightcore",
  "vaporwave": "vaporwave",
  "flanger": "flanger",
  "gate": "gate",
  "haas": "haas",
  "reverse": "reverse",
  "surround": "surround",
  "mcompand": "mcompand",
  "phaser": "phaser",
  "tremolo": "tremolo",
  "earwax": "earwax"
};
module.exports = async(client) => {
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
      /*========================================================
      # Cài đặt 1
      ========================================================*/
      {
        categoryId: 'setup',
        categoryName: "Setup",
        categoryDescription: "Thiết lập bot của bạn với cài đặt mặc định!",
        categoryOptionsList: [
          {
            optionId: 'prefix',
            optionName: "CustomPrefix",
            optionDescription: "Thay đổi prefix cho guilds",
            optionType: DBD.formTypes.input("Prefix của bạn.", 1, 5),
            getActualSet: async ({ guild }) => {
              const getPrefix = database.get(guild.id);
              return (getPrefix.setDefaultPrefix);
            },
            setNew: async({ guild, newData }) => {
              const getPrefix = database.get(guild.id);
              getPrefix.setDefaultPrefix = newData;
              await database.set(guild.id, getPrefix);
              console.log(`Đã đổi prefix mới cho ${guild.name}, prefix mới: ${newData}`);
            }
          },{
            optionId: 'volume',
            optionName: "DefaultVolume",
            optionDescription: "Thiết lập mặc định mức âm lượng",
            optionType: DBD.formTypes.input("Volume", 1, 150),
            getActualSet: async ({ guild }) => {
              const getVolume = database.get(guild.id);
              return (getVolume.setDefaultMusicData.DefaultVolume) || 50;
            },
            setNew: async ({ guild, newData }) => {
              const getVolume = database.get(guild.id);
              getVolume.setDefaultMusicData.DefaultVolume = Number(newData);
              await database.set(guild.id, getVolume);
            }
          },{
            optionId: 'autoplay',
            optionName: "DefaultAutoplay",
            optionDescription: "Thiết lập chế độ mặc định tự động phát",
            optionType: DBD.formTypes.switch(),
            getActualSet: async({ guild }) => {
              const defaultAutopl = database.get(guild.id);
              return (defaultAutopl.setDefaultMusicData.DefaultAutoplay);
            },
            setNew: async({ guild, newData }) => {
              const defaultAutopl = database.get(guild.id);
              defaultAutopl.setDefaultMusicData.DefaultAutoplay = Boolean(newData);
              await database.set(guild.id, defaultAutopl);
            }
          },{
            optionId: 'autoresume',
            optionName: "DefaultResume",
            optionDescription: "Thiết lập chế độ mặc định tự động phát lại nhạc khi bot lỗi",
            optionType: DBD.formTypes.switch(),
            getActualSet: async({ guild }) => {
              const defaultAutore = database.get(guild.id);
              return (defaultAutore.setDefaultMusicData.DefaultAutoresume);
            },
            setNew: async({ guild, newData }) => {
              const defaultAutore = database.get(guild.id);
              defaultAutore.setDefaultMusicData.DefaultAutoresume = Boolean(newData);
              await database.set(guild.id, defaultAutore);
            }
          },{
            optionId: 'djrole',
            optionName: "Djrole 🎶",
            optionDescription: "Thiết lập role dành riêng để phát nhạc (Hiện chưa thể dùng)",
            optionType: DBD.formTypes.rolesMultiSelect(false, true, false, true),
            getActualSet: async ({ guild }) => {
              const defaultAutopl = database.get(guild.id);
              return (defaultAutopl.setDefaultMusicData.Djroles);
            },
            setNew: async ({ guild, newData }) => {
              const defaultAutopl = database.get(guild.id);
              defaultAutopl.setDefaultMusicData.Djroles = newData;
              await database.set(guild.id, defaultAutopl);
            }
          },{
            optionId: "filters",
            optionName: "DefaultFilters",
            optionDescription: "Thiết lập Filters mặc định khi phát nhạc",
            optionType: DBD.formTypes.multiSelect(BotFilters),
            getActualSet: async ({ guild }) => {
              const defaultFilters = database.get(guild.id);
              return (defaultFilters.setDefaultMusicData.DefaultFilters);
            },
            setNew: async ({ guild, newData }) => {
              const defaultFilters = database.get(guild.id);
              defaultFilters.setDefaultMusicData.DefaultFilters = newData;
              await database.set(guild.id, defaultFilters);
            }
          },
        ]
      },
      /*========================================================
      # Cài đặt 2
      ========================================================*/
      {
        categoryId: 'welcomeGoodbye',
        categoryName: "welcomeGoodbye",
        categoryDescription: "Thiết lập welcomeGoodbye cho guilds!",
        categoryOptionsList: [
          {
            optionId: 'welcome',
            optionName: "WelcomeChannel",
            optionDescription: "Thiết lập welcome channel",
            optionType: DBD.formTypes.channelsSelect(false, channelTypes = [ChannelType.GuildText]),
            getActualSet: async ({ guild }) => {
              const getChannel = database.get(guild.id);
              return (getChannel.setDefaultWelcomeGoodbyeData.WelcomeChannel);
            },
            setNew: async({ guild, newData }) => {
              const getChannel = database.get(guild.id);
              getChannel.setDefaultWelcomeGoodbyeData.WelcomeChannel = newData;
              await database.set(guild.id, getChannel);
            }
          },{
            optionId: 'googbye',
            optionName: "GoodbyeChannel",
            optionDescription: "Thiết lập goodbye channel",
            optionType: DBD.formTypes.channelsSelect(false, channelTypes = [ChannelType.GuildText]),
            getActualSet: async ({ guild }) => {
              const getChannel = database.get(guild.id);
              return (getChannel.setDefaultWelcomeGoodbyeData.GoodbyeChannel);
            },
            setNew: async({ guild, newData }) => {
              const getChannel = database.get(guild.id);
              getChannel.setDefaultWelcomeGoodbyeData.GoodbyeChannel = newData;
              await database.set(guild.id, getChannel);
            }
          },{
            optionId: 'autoRole',
            optionName: "AutoAddRole",
            optionDescription: "Thiết lập tự động add role khi thành viên mới tham gia guilds",
            optionType: DBD.formTypes.rolesMultiSelect(false, true, false, true),
            getActualSet: async ({ guild }) => {
              const getRoles = database.get(guild.id);
              return (getRoles.setDefaultWelcomeGoodbyeData.AutoAddRoleWel);
            },
            setNew: async({ guild, newData }) => {
              const getRoles = database.get(guild.id);
              getRoles.setDefaultWelcomeGoodbyeData.AutoAddRoleWel = newData;
              await database.set(guild.id, getRoles);
            }
          },
        ]
      },
      /*========================================================
      # Cài đặt 3
      ========================================================*/
    ]
  });
  Dashboard.init();
};