const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const { setupDatabase, ticketHandler, EconomyHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});

module.exports = async(client) => {
  /*========================================================
  # EconomyHandler
  ========================================================*/
  client.cs = new EconomyHandler({
    EcoPath: "./Assets/Database/economy.json",
    setFormat: ["vi-VN", "VND"], // xác định loại tiền của các nước
    // Đặt số tiền ngân hàng mặc định khi người dùng mới được tạo!
    setDefaultWalletAmount: 10000, // trong ví tiền
    setDefaultBankAmount: 10000, // trong ngân hàng
    setMaxWalletAmount: 10000,// Đặt số lượng tiền trong ví tiền tối đa mặc định mà người dùng có thể có! ở đây 0 có nghĩa là vô hạn.
    setMaxBankAmount: 0, // Giới hạn dung lượng ngân hàng của nó ở đây 0 có nghĩa là vô hạn.
  });
  /*========================================================
  # interactionCreate.js
  ========================================================*/
  client.on("interactionCreate", async(interaction) => {
    const { customId } = interaction;
    if(interaction.isButton()) {
      if(customId === "inviteBot") {
        interaction.reply({ content: `[Bấm vào đây](${config.discordBot})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      } else if(customId === "inviteDiscord") {
        interaction.reply({ content: `[Bấm vào đây](${config.discord})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => {});
      };
      /*========================================================
      # ticket handlers 🎫 🎟️
      ========================================================*/
      const { handleTicketOpen, handleTicketClose } = new ticketHandler();
      if(customId === "TicketCreate") {
        return handleTicketOpen(interaction);
      } else if(customId === "TicketClose") {
        return handleTicketClose(interaction);
      };
      /*========================================================
      # 
      ========================================================*/
    } else if(interaction.isStringSelectMenu()) {
      //// 
    };
  });
  /*========================================================
  # autoresponse
  ========================================================*/
  client.on("messageCreate", async(message) => {
    if(message.author.bot || !message.guild) return;
    const autoresponsedata = new Database("./Assets/Database/autoresponse.json", { 
      databaseInObject: true 
    });
    const checkData = await autoresponsedata.has(message.guild.id);
    if(!checkData) {
      await autoresponsedata.set(message.guild.id, [
          { name: "", wildcard: "", responses: "" }
      ]); 
    };
    const data = await autoresponsedata.get(message.guild.id);
    if(!data) return;
    if(data) {
      if(data.some((data) => message.cleanContent.includes(data.name) && data.wildcard || data.name == message.cleanContent && !data.wildcard)) {
         let response = data.find((data) => message.cleanContent.includes(data.name) && data.wildcard || data.name == message.cleanContent && !data.wildcard);
         return message.reply({ 
           content: `${response.responses}`
         }).catch((ex) => {});
      };
    };
  });
};