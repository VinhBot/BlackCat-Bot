const { ChannelType } = require("discord.js");
const DBD = require("discord-dashboard");
const SoftUI = require('dbd-soft-ui');
const { musicEmbedDefault } = require(`${process.cwd()}/Events/functions`);
const database = require(`${process.cwd()}/Assets/Schemas/music`);
/*========================================================
# Thiết lập music Channel
========================================================*/
const setupMusic = (client, config) => {
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
              const getChannel = await database.findOne({ GuildId: guild.id });
              return (getChannel.ChannelId);
            },
            setNew: async({ guild, newData }) => {
              client.channels.fetch(newData).then((channel) => {
                channel.send(musicEmbedDefault(client, guild)).then(async(msg) => {
                  const guildData = await database.findOne({ GuildId: guild.id });
                  // Cập nhật thuộc tính setDefaultMusicData với giá trị mới
                  guildData.ChannelId = channel.id;
                  guildData.MessageId = msg.id;
                  // thiết lập thuộc tính với giá trị mới
                  return await guildData.save();
                }).catch((ex) => {});
              });
            }, 
          },{
            optionId: 'volume',
            optionName: "Default Volume",
            optionDescription: "Thiết lập mặc định mức âm lượng (1 - 150)",
            optionType: SoftUI.formTypes.numberPicker(1, 150, false),
            getActualSet: async ({ guild }) => {
              const getVolume = database.findOne({ GuildId: guild.id });
              return (getVolume.DefaultVolume) || 50;
            },
            setNew: async ({ guild, newData }) => {
              const getVolume = database.findOne({ GuildId: guild.id });
              getVolume.DefaultVolume = Number(newData);
              await getVolume.save();
            }
          },{
            optionId: 'autoplay',
            optionName: "Default Autoplay",
            optionDescription: "Thiết lập chế độ mặc định tự động phát",
            optionType: DBD.formTypes.switch(),
            getActualSet: async({ guild }) => {
              const defaultAutopl = database.findOne({ GuildId: guild.id });
              return (defaultAutopl.DefaultAutoplay);
            },
            setNew: async({ guild, newData }) => {
              const defaultAutopl = database.findOne({ GuildId: guild.id });
              defaultAutopl.DefaultAutoplay = Boolean(newData);
              await defaultAutopl.save();
            }
          },{
            optionId: 'autoresume',
            optionName: "Default Resume",
            optionDescription: "Thiết lập chế độ mặc định tự động phát lại nhạc khi bot lỗi",
            optionType: DBD.formTypes.switch(),
            getActualSet: async({ guild }) => {
              const defaultAutore = database.findOne({ GuildId: guild.id });
              return (defaultAutore.DefaultAutoresume);
            },
            setNew: async({ guild, newData }) => {
              const defaultAutore = database.findOne({ GuildId: guild.id });
              defaultAutore.DefaultAutoresume = Boolean(newData);
              await defaultAutore.save();
            }
          },{
            optionId: 'djrole',
            optionName: "Djrole 🎶",
            optionDescription: "Thiết lập role dành riêng để phát nhạc (Hiện chưa thể dùng)",
            optionType: DBD.formTypes.rolesMultiSelect(false, true, false, true),
            getActualSet: async ({ guild }) => {
              const defaultAutopl = database.findOne({ GuildId: guild.id });;
              return (defaultAutopl.Djroles);
            },
            setNew: async ({ guild, newData }) => {
              const defaultAutopl = database.findOne({ GuildId: guild.id });
              defaultAutopl.Djroles = newData;
              await defaultAutopl.save();
            }
          },{
            optionId: "filters",
            optionName: "Default Filters",
            optionDescription: "Thiết lập Filters mặc định khi phát nhạc",
            optionType: DBD.formTypes.multiSelect(BotFilters),
            getActualSet: async ({ guild }) => {
              const defaultFilters = database.findOne({ GuildId: guild.id });
              return (defaultFilters.DefaultFilters);
            },
            setNew: async ({ guild, newData }) => {
              const defaultFilters = database.findOne({ GuildId: guild.id });
              defaultFilters.DefaultFilters = newData;
              await defaultFilters.save();
            }
          },
        ])
      },
    ]
  };
};


module.exports = setupMusic;