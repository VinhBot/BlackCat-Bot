const { ChannelType } = require("discord.js");
const DBD = require("discord-dashboard");
const SoftUI = require('dbd-soft-ui');
const { welcomeGoodbye: database } = require(`${process.cwd()}/Assets/Schemas/database`);
/*========================================================
# Thiết lập welcome & goodbye 
========================================================*/
const welconmeGoodbyeCh = (client, config) => {
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
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.WelcomeChannel);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.WelcomeChannel = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh welcome đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "ChannelGoodbye",
              optionName: "Goodbye Channel",
              optionDescription: "Thiết lập kênh goodbye",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild, user }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.GoodbyeChannel);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.GoodbyeChannel = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh Goodbye đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "roleWelcome",
              optionName: "Welcome Roles",
              optionDescription: "Thiết lập role tự động add khi thành viên tham gia guild",
              optionType: DBD.formTypes.rolesMultiSelect(false, true, false, true),
              getActualSet: async({ guild, user }) => {
                const getRoles = await database.findOne({ GuildId: guild.id });
                return (getRoles.AutoAddRoleWel);
              },
              setNew: async({ guild, newData }) => {
                const getRoles = await database.findOne({ GuildId: guild.id });
                getRoles.AutoAddRoleWel = newData;
                return await getRoles.save();
              },
            },
        ]),
      }
    ]
  };
};

module.exports = welconmeGoodbyeCh;