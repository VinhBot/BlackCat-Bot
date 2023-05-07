const { ChannelType } = require("discord.js");
const DBD = require("discord-dashboard");
const SoftUI = require('dbd-soft-ui');
const { Database } = require("st.db");
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true,
});

const diaryChannel = (client) => {
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
              optionId: "Channel-Create",
              optionName: "channelCreate",
              optionDescription: "Gởi khi kênh được tạo",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.get(guild.id);
                return (getChannel.setDiaryChannel.channelCreate);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.get(guild.id);
                getChannel.setDiaryChannel.channelCreate = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh welcome đã được thiết lập!');
                });
                return await database.set(guild.id, getChannel);
              },
            },{
              optionId: "Channel-Deleted",
              optionName: "channelDeleted",
              optionDescription: "Gởi tin nhắn khi kênh bị xoá",
              optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
              getActualSet: async({ guild }) => {
                const getChannel = await database.get(guild.id);
                return (getChannel.setDiaryChannel.channelDelete);
              },
              setNew: async({ guild, newData }) => {
                const getChannel = await database.get(guild.id);
                getChannel.setDiaryChannel.chgetChannel.channelDelete = newData;
                client.channels.fetch(newData).then((channel) => {
                  channel.send('Kênh Goodbye đã được thiết lập!');
                });
                return await database.set(guild.id, getChannel);
              },
            },
        ]),
      }
    ]
  };
};

module.exports = diaryChannel;