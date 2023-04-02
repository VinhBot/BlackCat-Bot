const { ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "fun", // Tên lệnh 
  description: "các lệnh vui vẻ", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "dinogoogle", 
      description: "Khủng long vượt trướng ngoại vật", 
      type: ApplicationCommandOptionType.Subcommand, 
    },
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "dinogoogle") {
      await interaction.reply({ content: `---------------🦖` });
      let time = 1 * 1000;
      setTimeout(function () {
          interaction.editReply(`-----------🦖----`);
      }, time);
      time += 1.5 * 1000;
      
      setTimeout(function () {
        interaction.editReply(`----------🦖------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`--------🦖--------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`------🦖-----------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`-------🦖-----------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`---🌵-----🦖---------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`---🌵-🦖-------------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`🦖\n ---🌵--------------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`------🦖---🌵--------------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`----🦖-----🌵----------------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`-🌵🌵-----🦖-------🌵--------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`----🌵🌵-🦖----------🌵------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`🦖\n ---🌵🌵-------------🌵---`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`-----🦖---🌵🌵-------------🌵--`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`-------🦖-----🌵🌵-------------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`🎁----🦖--------🌵🌵-----------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`---🎁--🦖----------🌵🌵---------`);
      }, time);
      time += 1.5 * 1000;

      setTimeout(function () {
        interaction.editReply(`**Ⓜⓘⓢⓢⓘⓞⓝ Ⓒⓞⓜⓟⓛⓔⓣⓔⓓ !**\n ---🎁🦖----------🌵🌵-------------`);
      }, time);
    };
  },
};