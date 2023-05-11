const { EmbedBuilder } = require("discord.js");

module.exports = {
	eventName: "messageCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: (client, message) => {
    if(message.author.bot) return;
    
  },
};