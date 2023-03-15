const { EmbedBuilder, parseEmoji, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType, Collection, SelectMenuBuilder } = require("discord.js");

const onCoolDown = (message, command) => {
      if(!message || !message.client) throw "";
      if(!command || !command.name) throw "";
      const client = message.client;
      if (!client.cooldowns.has(command.name)) { 
         client.cooldowns.set(command.name, new Collection());
      };
      const now = Date.now(); 
      const timestamps = client.cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown) * 1000; 
      if (timestamps.has(message.member.id)) { 
         const expirationTime = timestamps.get(message.member.id) + cooldownAmount; 
         if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000; 
            return timeLeft
         } else {
            timestamps.set(message.member.id, now); 
            setTimeout(() => timestamps.delete(message.member.id), cooldownAmount); 
            return false;
         }
      } else {
         timestamps.set(message.member.id, now); 
         setTimeout(() => timestamps.delete(message.member.id), cooldownAmount); 
         return false;
      };
};

module.exports = {
  onCoolDown 
};