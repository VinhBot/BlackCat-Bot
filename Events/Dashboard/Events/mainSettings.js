const DBD = require("discord-dashboard");
const prefixDB = require(`${process.cwd()}/Assets/Schemas/prefix`);
const mainSettings = (client, database, config) => {
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
          const getPrefix = prefixDB.findOne({ GuildId: guild.id });
          return (getPrefix.Prefix);
        },
        setNew: async({ guild, newData }) => {
          const getPrefix = prefixDB.findOne({ GuildId: guild.id });
          getPrefix.Prefix = newData;
          return await getPrefix.save();
        }
      },
    ]
  };
};

module.exports = mainSettings;