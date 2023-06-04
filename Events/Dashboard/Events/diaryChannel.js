const { ChannelType } = require("discord.js");
const DBD = require("discord-dashboard");
const SoftUI = require('dbd-soft-ui');
const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);

const diaryChannel = (client, database, config) => {
  return {
    categoryId: 'diaryChannel-setup',
    categoryName: "Kênh nhật ký 📝",
    categoryDescription: "Thiết lập hệ thống kênh nhật ký cho Guilds!",
    categoryImageURL: "https://img.wattpad.com/5e8473b39c526015ac6fc6d3fe57cc477c95655d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f7568496a3165393051344b736f513d3d2d31342e313438386261653533323830616238343432343734303833373432302e676966",
    categoryOptionsList: [
      {
        optionId: "Channel-Create-setup",
        optionName: "Thiết Lập Channel",
        optionDescription: "Thiết lập kênh nhật ký theo yêu cầu",
        optionType: SoftUI.formTypes.multiRow([
            {
              optionId: "Channel-voiceStateUpdate",
              optionName: "voiceStateUpdate",
              optionDescription: "Gởi tin nhắn nhật ký voice",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.voiceStateUpdate);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.voiceStateUpdate = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "Channel-Create",
              optionName: "channelCreate",
              optionDescription: "Gởi khi kênh được tạo",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.channelCreate);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.channelCreate = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "Channel-Deleted",
              optionName: "channelDeleted",
              optionDescription: "Gởi tin nhắn khi kênh bị xoá",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.channelDelete);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.channelDelete = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "Channel-Update",
              optionName: "channelUpdate",
              optionDescription: "Gởi tin nhắn khi kênh được cập nhật",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.channelUpdate);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.channelUpdate = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "Channel-guildMemberUpdate",
              optionName: "guildMemberUpdate",
              optionDescription: "Gởi tin nhắn khi thành viên trong guilds thay đổi",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.guildMemberUpdate);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.guildMemberUpdate = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "Channel-guildCreate",
              optionName: "guildCreate",
              optionDescription: "Gởi tin nhắn khi bot tham gia guilds mới",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.guildCreate);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.guildCreate = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "Channel-guildDelete",
              optionName: "guildDelete",
              optionDescription: "Gởi tin nhắn bot bị kick ra khỏi guilds",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.guildDelete);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.guildDelete = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },{
              optionId: "Channel-guildUpdate",
              optionName: "guildUpdate",
              optionDescription: "Gởi tin nhắn khi guilds được chỉnh sửa",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                return (getChannel.guildUpdate);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.findOne({ GuildId: guild.id });
                getChannel.guildUpdate = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh đã được thiết lập!');
                });
                return await getChannel.save();
              },
            },
        ]),
      }
    ]
  };
};

module.exports = diaryChannel;