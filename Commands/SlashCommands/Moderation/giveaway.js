const { ApplicationCommandOptionType } = require("discord.js");
const { GiveawayClass } = require(`${process.cwd()}/Events/functions`)

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
            type: ApplicationCommandOptionType.Integer,
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
      const response = await giveaway.pause(interaction.member, messageId);
      return interaction.reply(response);
    } else if(subCommands === "resume") {
      const messageId = interaction.options.getString("message_id");
      const response = await giveaway.resume(interaction.member, messageId);
      return interaction.reply(response);
    } else if(subCommands === "end") {
      const messageId = interaction.options.getString("message_id");
      const response = await giveaway.end(interaction.member, messageId);
      return interaction.reply(response);
    } else if(subCommands === "reroll") {
      const messageId = interaction.options.getString("message_id");
      const response = await giveaway.reroll(interaction.member, messageId);
      return interaction.reply(response);
    } else if(subCommands === "list") {
      const response = await giveaway.list(interaction.member);
      return interaction.reply(response);
    } else if(subCommands === "") {
      const messageId = interaction.options.getString("message_id");
      const addDurationMs = ems(interaction.options.getInteger("add_duration"));
      if(!addDurationMs) return interaction.followUp("Không phải là một khoảng thời gian hợp lệ");
      const newPrize = interaction.options.getString("new_prize");
      const newWinnerCount = interaction.options.getInteger("new_winners");
      const response = await giveaway.edit(interaction.member, messageId, addDurationMs, newPrize, newWinnerCount);
      return interaction.reply(response);
    };
  },
};