const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { GiveawayClass } = require(`${process.cwd()}/Events/functions`)
const ems = require("enhanced-ms");

module.exports = {
  name: "giveaway", // Tên lệnh 
  description: "Thiết lập giveaway cho guilds", // Mô tả lệnh
  userPerms: ["Administrator"], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "start", 
      description: "Thiết lập giveaway cho channle", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "channel", 
        description: "chọn kênh bạn muốn bắt đầu giveaway", 
        type: ApplicationCommandOptionType.Channel,
        required: true, 
      }],
    },{ 
      name: "pause", 
      description: "Tạm dừng giveaway", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "message_id", 
        description: "cung cấp id của giveaway trước đó", 
        type: ApplicationCommandOptionType.String,
        required: true, 
      }],
    },{ 
      name: "resume", 
      description: "tiếp tục giveaway", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "message_id", 
        description: "cung cấp id của giveaway trước đó", 
        type: ApplicationCommandOptionType.String,
        required: true, 
      }],
    },{ 
      name: "end", 
      description: "kết thúc giveaway", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "message_id", 
        description: "cung cấp id của giveaway trước đó", 
        type: ApplicationCommandOptionType.String,
        required: true, 
      }],
    },{ 
      name: "reroll", 
      description: "tiếp tục sử dụng lại giveaway trước đó", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "message_id", 
        description: "cung cấp id của giveaway trước đó", 
        type: ApplicationCommandOptionType.String,
        required: true, 
      }],
    },{ 
      name: "list", 
      description: "xem danh sách giveaway", 
      type: ApplicationCommandOptionType.Subcommand, 
    },{
      name: "edit",
      description: "chỉnh sửa giveaway",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
          {
            name: "message_id",
            description: "id tin nhắn của giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },{
            name: "add_duration",
            description: "số phút để thêm vào thời lượng giveaway",
            type: ApplicationCommandOptionType.String,
            required: false,
          },{
            name: "new_prize",
            description: "giải thưởng mới",
            type: ApplicationCommandOptionType.String,
            required: false,
          },{
            name: "new_winners",
            description: "số lượng người chiến thắng mới",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
      ],
    },
  ],
  run: async(client, interaction) => {
    const subCommands = interaction.options.getSubcommand();
    const giveaway = new GiveawayClass(client);
    if(subCommands === "start") {
      const channel = interaction.options.getChannel("channel");
      return await giveaway.runModalSetup(interaction, channel);
    } else if(subCommands === "pause") {
      const messageId = interaction.options.getString("message_id");
      const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === interaction.guild.id);
      if(!giveaway) return interaction.reply(`Không thể tìm thấy giveaway cho messageId: ${messageId}`);
      if(giveaway.pauseOptions.isPaused) return interaction.reply("Giveaway này đã được tạm dừng.");
      giveaway.pause().then(() => {
        return interaction.reply('Thành công! Giveaway đã tạm dừng!').then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      }).catch((err) => {
        return interaction.reply(`Đã xảy ra lỗi, vui lòng kiểm tra và thử lại.\n\`${err}\``).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      });
    } else if(subCommands === "resume") {
      const messageId = interaction.options.getString("message_id");
      const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === interaction.guild.id);
      if(!giveaway) return interaction.reply(`Không thể tìm thấy giveaway cho messageId: ${messageId}`);
      if(!giveaway.pauseOptions.isPaused) return interaction.reply("Giveaway này không được tạm dừng.");
      giveaway.unpause().then(() => {
        return interaction.reply('Thành công! Giveaway đã được tiếp tục!').then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      }).catch((err) => {
        return interaction.reply(`Đã sảy ra lỗi, Vui lòng kiểm tra và thử lại.\n\`${err}\``).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      });
    } else if(subCommands === "end") {
      const messageId = interaction.options.getString("message_id");
      const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === interaction.guild.id);
      if(!giveaway) return interaction.reply(`Không thể tìm thấy giveaway cho messageId: ${messageId}`);
      if(giveaway.ended) return interaction.reply("Giveaway đã kết thúc.");
      giveaway.end().then(() => {
        return interaction.reply('Thành công! Giveaway đã được kết thúc!').then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      }).catch((err) => {
        return interaction.reply(`Đã sảy ra lỗi, Vui lòng kiểm tra và thử lại.\n\`${err}\``).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      });
    } else if(subCommands === "reroll") {
      const messageId = interaction.options.getString("message_id");
      const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === interaction.guild.id);
      if(!giveaway) return interaction.reply(`Không thể tìm thấy giveaway cho messageId: ${messageId}`);
      if(!giveaway.ended) return interaction.reply("Giveaway vẫn chưa kết thúc.");
      giveaway.reroll().then(() => {
        return interaction.reply('Thành công! Giveaway đã được bắt đầu lại!').then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      }).catch((err) => {
        return interaction.reply(`Đã sảy ra lỗi, Vui lòng kiểm tra và thử lại.\n\`${err}\``).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      });
    } else if(subCommands === "list") {
      const giveaways = client.giveawaysManager.giveaways.filter((g) => g.guildId === interaction.guild.id && g.ended === false);
      if(giveaways.length === 0) return interaction.reply("Không có giveaway nào chạy trong máy chủ này.");
      const description = giveaways.map((g, i) => `${i + 1}. ${g.prize} trong <#${g.channelId}>`).join("\n");
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor("Random").setDescription(description)]
      });
    } else if(subCommands === "edit") {
      const messageId = interaction.options.getString("message_id");
      const addDurationMs = ems(interaction.options.getString("add_duration"));
      if(!addDurationMs) return interaction.followUp("Không phải là một khoảng thời gian hợp lệ");
      const newPrize = interaction.options.getString("new_prize");
      const newWinnerCount = interaction.options.getInteger("new_winners");
      const giveaway = client.giveawaysManager.giveaways.find((g) => g.messageId === messageId && g.guildId === interaction.guild.id);
      if(!giveaway) return interaction.reply(`Không thể tìm thấy giveaway cho messageId: ${messageId}`);
      await client.giveawaysManager.edit(messageId, {
        addTime: addDurationMs || 0,
        newPrize: newPrize || giveaway.prize,
        newWinnerCount: newWinnerCount || giveaway.winnerCount,
      }).then(() => {
        return interaction.reply('Thành công! Giveaway đã được chỉnh sửa!').then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      }).catch((err) => {
        return interaction.reply(`Đã sảy ra lỗi, Vui lòng kiểm tra và thử lại.\n\`${err}\``).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        });
      });
    };
  },
};