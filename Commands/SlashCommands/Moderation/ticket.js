const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "ticket", // Tên lệnh 
  description: "quản lý ticket", // Mô tả lệnh
  userPerms: ["Administrator"], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "create", 
      description: "tạo ticket cho server", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [{
        name: "channel", 
        description: "bạn muốn cài đặt ở kênh nào", 
        type: ApplicationCommandOptionType.Channel,
        required: true, 
      }],
    },{
      name: "close",
      description: "đóng ticket [chỉ được sử dụng trong kênh ticket]",
      type: ApplicationCommandOptionType.Subcommand,
    },{
      name: "add",
      description: "thêm người dùng vào kênh ticket hiện tại [chỉ được sử dụng trong kênh ticket]",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "user_id",
        description: "id của thành viên để thêm",
        type: ApplicationCommandOptionType.String,
        required: true,
      }],
    },{
      name: "remove",
      description: "xóa thành viên khỏi kênh ticket [chỉ được sử dụng trong kênh ticket]",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "user",
        description: "thành viên cần loại bỏ",
        type: ApplicationCommandOptionType.User,
        required: true,
      }],
    },
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "create") {
      const ChannelId = interaction.options.getChannel("channel");
      return client.ticketModalSetup(interaction, ChannelId);
    } else if(interaction.options.getSubcommand() === "close") {
      return await interaction.reply(await client.ticketClose(interaction, interaction.user));
    } else if(interaction.options.getSubcommand() === "add") {
      const userId = interaction.options.getString("user_id");
      return await interaction.reply(await client.addToTicket(interaction, userId));
    } else if(interaction.options.getSubcommand() === "remove") {
      const user = interaction.options.getUser("user");
      return await interaction.reply(await client.removeFromTicket(interaction, user.id));
    };
  },
};