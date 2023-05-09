const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("st.db");
const { EconomyHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);

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
};