const { ChannelType } = require("discord.js");
const DBD = require("discord-dashboard");
const SoftUI = require('dbd-soft-ui');
const { Database } = require("st.db");
const theme = require("./theme.js");
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true,
});
/*========================================================
# Main 
========================================================*/
const mainSettings = (client) => {
  return {
    categoryId: 'mainSettings-option',
    categoryName: "Main Settings 🛠️",
    categoryDescription: "Thiết lập một số cài đặt mặc định dành cho Guilds",
    categoryImageURL: "https://img.wattpad.com/5e8473b39c526015ac6fc6d3fe57cc477c95655d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f7568496a3165393051344b736f513d3d2d31342e313438386261653533323830616238343432343734303833373432302e676966",
    categoryOptionsList: [
      {
        optionId: 'prefix',
        optionName: "Custom Prefix",
        optionDescription: "Thay đổi prefix cho guilds (nhỏ nhất 1, lớn nhất 5 chữ cái, kí hiệu)",
        optionType: DBD.formTypes.input("Prefix của bạn là gì ?", 1, 5),
        getActualSet: async ({ guild }) => {
          const getPrefix = database.get(guild.id);
          return (getPrefix.setDefaultPrefix);
        },
        setNew: async({ guild, newData }) => {
          const getPrefix = database.get(guild.id);
          getPrefix.setDefaultPrefix = newData;
          return await database.set(guild.id, getPrefix);
        }
      },
    ]
  };
};
/*========================================================
# Thiết lập welcome & goodbye 
========================================================*/
const welconmeGoodbyeCh = (client) => {
  return {
    categoryId: 'WelcomeGoodbye-setup',
    categoryName: "Welcome & Goodbye 👋",
    categoryDescription: "Thiết lập hệ thống welcome, goodbye cho Guilds!",
    categoryImageURL: "https://img.wattpad.com/5e8473b39c526015ac6fc6d3fe57cc477c95655d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f7568496a3165393051344b736f513d3d2d31342e313438386261653533323830616238343432343734303833373432302e676966",
    categoryOptionsList: [
      {
        optionId: "setChannelWelcome-Goodbye",
        optionName: "Welcome & Goodbye & Roles",
        optionDescription: "Thiết lập kênh welcone, goodbye và role",
        optionType: SoftUI.formTypes.multiRow([
            {
              optionId: "ChannelWelcome",
              optionName: "Welcome Channel",
              optionDescription: "Thiết lập kênh welcome",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild, user }) => {
                const getChannel = await database.get(guild.id);
                return (getChannel.setDefaultWelcomeGoodbyeData.WelcomeChannel);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.get(guild.id);
                getChannel.setDefaultWelcomeGoodbyeData.WelcomeChannel = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh welcome đã được thiết lập!');
                });
                return await database.set(guild.id, getChannel);
              },
            },{
              optionId: "ChannelGoodbye",
              optionName: "Goodbye Channel",
              optionDescription: "Thiết lập kênh goodbye",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild, user }) => {
                const getChannel = await database.get(guild.id);
                return (getChannel.setDefaultWelcomeGoodbyeData.GoodbyeChannel);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.get(guild.id);
                getChannel.setDefaultWelcomeGoodbyeData.GoodbyeChannel = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh Goodbye đã được thiết lập!');
                });
                return await database.set(guild.id, getChannel);
              },
            },{
              optionId: "roleWelcome",
              optionName: "Welcome Roles",
              optionDescription: "Thiết lập role tự động add khi thành viên tham gia guild",
              optionType: DBD.formTypes.rolesMultiSelect(false, true, false, true),
              getActualSet: async({ guild, user }) => {
                const getRoles = await database.get(guild.id);
                return (getRoles.setDefaultWelcomeGoodbyeData.AutoAddRoleWel);
              },
              setNew: async({ guild, newData }) => {
                const getRoles = await database.get(guild.id);
                getRoles.setDefaultWelcomeGoodbyeData.AutoAddRoleWel = newData;
                return await database.set(guild.id, getRoles);
              },
            },
        ]),
      }, // kết thúc lựa chọn 1
    ]
  };
};
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
  const embeds = (guilds) => {
    const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
    const guild = client.guilds.cache.get(guilds.id);
    var Emojis = [`0️⃣`, `1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`, `6️⃣`, `7️⃣`, `8️⃣`, `9️⃣`, `🔟`, `🟥`,`🟧`, `🟨`, `🟩`, `🟦`, `🟪`, `🟫`];
    return {
      embeds: [new EmbedBuilder()
        .setColor("Random")
        .setTitle(`📃 hàng đợi của __${guild.name}__`)
        .setDescription(`**Hiện tại có __0 Bài hát__ trong Hàng đợi**`)
        .setThumbnail(guild.iconURL({ dynamic: true })),
        new EmbedBuilder()
        .setColor("Random")
        .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
        .setImage(guild.banner ? guild.bannerURL({ size: 4096 }) : "https://i.pinimg.com/originals/72/97/52/729752d06f814ebfbcc9a35215e2b897.jpg")
        .setTitle(`Bắt đầu nghe nhạc, bằng cách kết nối với Kênh thoại và gửi **LIÊN KẾT BÀI HÁT** hoặc **TÊN BÀI HÁT** trong Kênh này!`)
        .setDescription(`> *Tôi hỗ trợ Youtube, Spotify, Soundcloud và các liên kết MP3 trực tiếp!*`)
      ], components: [new ActionRowBuilder().addComponents([
        new StringSelectMenuBuilder().setCustomId(`StringSelectMenuBuilder`).addOptions([`Pop`, `Strange-Fruits`, `Gaming`, `Chill`, `Rock`, `Jazz`, `Blues`, `Metal`, `Magic-Release`, `NCS | No Copyright Music`, `Default`].map((t, index) => {
            return {
              label: t.substr(0, 25),
              value: t.substr(0, 25),
              description: `Tải Danh sách phát nhạc: '${t}'`.substr(0, 50),
              emoji: Emojis[index]
            };
          }))
        ]),
        new ActionRowBuilder().addComponents([
          new ButtonBuilder().setStyle('Primary').setCustomId('Skip').setEmoji(`⏭`).setLabel(`Skip`).setDisabled(),
          new ButtonBuilder().setStyle('Danger').setCustomId("1").setEmoji(`🏠`).setLabel(`Stop`).setDisabled(),
          new ButtonBuilder().setStyle('Secondary').setCustomId('Pause').setEmoji('⏸').setLabel(`Pause`).setDisabled(),
          new ButtonBuilder().setStyle('Success').setCustomId('Autoplay').setEmoji('🔁').setLabel(`Autoplay`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Shuffle').setEmoji('🔀').setLabel(`Shuffle`).setDisabled(),
        ]),
        new ActionRowBuilder().addComponents([
          new ButtonBuilder().setStyle('Success').setCustomId('Song').setEmoji(`🔁`).setLabel(`Song`).setDisabled(),
          new ButtonBuilder().setStyle('Success').setCustomId('Queue').setEmoji(`🔂`).setLabel(`Queue`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Forward').setEmoji('⏩').setLabel(`+10 Sec`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Rewind').setEmoji('⏪').setLabel(`-10 Sec`).setDisabled(),
          new ButtonBuilder().setStyle('Primary').setCustomId('Lyrics').setEmoji('📝').setLabel(`Lyrics`).setDisabled(),
        ]),
    ]};
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
                channel.send(embeds(guild)).then(async(msg) => {
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
/*========================================================
# Khởi chạy Dashboard
========================================================*/
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
      mainSettings(client),
      welconmeGoodbyeCh(client), 
      setupMusic(client), 
    ]
  });
  Dashboard.init();
};