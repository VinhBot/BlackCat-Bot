const { ChannelType } = require("discord.js");
const DBD = require("discord-dashboard");
const SoftUI = require('dbd-soft-ui');
const { Database } = require("st.db");
const { musicEmbedDefault } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true,
});

/*========================================================
# Thiết lập music Channel
========================================================*/
const setupMusic = (client) => {
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
  return {
    categoryId: 'MusicCommands-setup',
    categoryName: "Music Commands 🎶",
    categoryDescription: "Thiết lập một số lệnh âm nhạc cho guilds!",
    categoryImageURL: "https://img.wattpad.com/5e8473b39c526015ac6fc6d3fe57cc477c95655d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f7568496a3165393051344b736f513d3d2d31342e313438386261653533323830616238343432343734303833373432302e676966",
    categoryOptionsList: [
      {
        optionId: "settings-music",
        optionName: "Cài đặt",
        optionDescription: "Thiết lập một số cài đặt dành cho MusicCommands",
        optionType: SoftUI.formTypes.multiRow([
          {
            optionId: "ChannelMusic-setup",
            optionName: "Autoplay Music 🎵",
            optionDescription: "Thiết lập kênh tự động phát nhạc theo yêu cầu",
            optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
            getActualSet: async({ guild, user }) => {
              const getChannel = await database.get(guild.id);
              return (getChannel.setDefaultMusicData.ChannelId);
            },
            setNew: async({ guild, newData }) => {
              client.channels.fetch(newData).then((channel) => {
                channel.send(musicEmbedDefault(client, guild)).then(async(msg) => {
                  const guildData = await database.get(guild.id);
                  // Cập nhật thuộc tính setDefaultMusicData với giá trị mới
                  guildData.setDefaultMusicData.ChannelId = channel.id;
                  guildData.setDefaultMusicData.MessageId = msg.id;
                  // thiết lập thuộc tính với giá trị mới
                  return await database.set(guild.id, guildData);
                }).catch((ex) => {});
              });
            }, 
          },{
            optionId: 'volume',
            optionName: "Default Volume",
            optionDescription: "Thiết lập mặc định mức âm lượng (1 - 150)",
            optionType: SoftUI.formTypes.numberPicker(1, 150, false),
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
            optionName: "Default Autoplay",
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
            optionName: "Default Resume",
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
            optionName: "Default Filters",
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
        ])
      },
    ]
  };
};


module.exports = setupMusic;