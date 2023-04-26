const { ChannelType } = require("discord.js");
const { readdirSync } = require("node:fs");
const DBD = require("discord-dashboard");
const { Database } = require("st.db");
const SoftUI = require("dbd-soft-ui");
const config = require(`${process.cwd()}/config.json`);
const language = require("./language.js");
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
  /*========================================================
  # Commands list
  ========================================================*/
  let Music = [];
  client.commands.map((command) => {
    Music.push({
      commandName: `${config.prefix + command.name}`,
      commandUsage: command.usage || "Không sử dụng",
      commandDescription: command.description || "Không có mô tả",
    });
  });
  /*========================================================
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
    theme: SoftUI({
      websiteName: "BlackCat-Club", // Tên trang web
      colorScheme: "pink", // theme
      supporteMail: "vinhdocle2k3@gmail.com", // email hỗ trợ
      locales: language, // thiết lập ngôn ngữ cho dashboard
      customThemeOptions: {
        index: async({ req, res, config }) => {
            return {
              values: [],
              graph: {},
              cards: [],
            }
        },
      },
      // Icons
      icons: {
        favicon: client.user?.displayAvatarURL({ size: 4096 }),
        noGuildIcon: "https://pnggrid.com/wp-content/uploads/2021/05/Discord-Logo-Circle-1024x1024.png",
        sidebar: {
          darkUrl: client.user?.displayAvatarURL({ size: 4096 }),
          lightUrl: client.user?.displayAvatarURL({ size: 4096 }),
          hideName: true,
          borderRadius: false,
          alignCenter: true,
        },
      },
      index: {
        card: {
          category: "Soft UI",
          title: "Trợ lý - Trung tâm của mọi thứ",
          description: `
            <b>
              <i>${client.user.username}</i>
            </b>
          `,
          image: "https://media.discordapp.net/attachments/1092828708798214284/1092828811818709113/music.gif",
          link: {
            enabled: true,
            url: "https://www.facebook.com/BlackCat.2k3"
          }
        },
        graph: {
          enabled: true,
          lineGraph: false,
          title: 'Memory Usage',
          tag: 'Memory (MB)',
          max: 100
        },
      },
      sweetalert: {
        errors: {},
        success: {
          login: "Đã đăng nhập thành công.",
        }
      },
      preloader: {
        image: "https://media.discordapp.net/attachments/1092828708798214284/1092828811818709113/music.gif",
        spinner: false,
        text: "Loading ...",
      },
      admin: {
        pterodactyl: {
          enabled: false,
          apiKey: "apiKey",
          panelLink: "https://panel.website.com",
          serverUUIDs: []
        }
      },
      commands: [
        {
					category: "Music",
					subTitle: "Music Commands",
					aliasesDisabled: false,
					list: Music,
				},
      ],
    }),
    settings: [
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
      },{
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
      }
    ]
  });
  Dashboard.init();
};