const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
module.exports = {
  name: "economy", // Tên lệnh 
  description: "hệ thống tiền tệ :))", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "leaderboard", 
      description: "Xem bảng sếp hạng người có tiền", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "beg", 
      description: "Một cách để kiếm tiền, Beg", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "daily", 
      description: "Một cách để kiếm tiền, Daily", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "hafly", 
      description: "Một cách để kiếm tiền, Hafly", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "hourly", 
      description: "Một cách để kiếm tiền, Hourly", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "weekly", 
      description: "Một cách để kiếm tiền, Weekly", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "monthly", 
      description: "Một cách để kiếm tiền, Monthly", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "quaterly", 
      description: "Một cách để kiếm tiền, Quaterly", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "yearly", 
      description: "Một cách để kiếm tiền, Yearly", 
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "transfermoney", 
      description: "Chuyển tiền cho thành viên nào đó", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "user", 
        description: "bạn muốn chuyển tiền cho ai", 
        type: ApplicationCommandOptionType.User,
        require: false,
      }],
    },{ 
      name: "rob", 
      description: "Trộm tiền ai đó", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user", 
          description: "bạn muốn trộm tiền của ai", 
          type: ApplicationCommandOptionType.User,
          require: true,
        },{
          name: "amount", 
          description: "số tiền bạn muốn gởi", 
          type: ApplicationCommandOptionType.Number,
          require: true,
        }
      ],
    },{ 
      name: "cash", 
      description: "Xem số dư tài khoản", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "user", 
        description: "bạn muốn xem số dư tài khoản của ai", 
        type: ApplicationCommandOptionType.User,
        require: false,
      }],
    },{ 
      name: "deposite", 
      description: "Gửi tiền vào ngân hàng của bạn", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "amount", 
        description: "bạn muốn gởi bao nhiêu tiền vào ngân hàng", 
        type: ApplicationCommandOptionType.Number,
        require: true,
      }],
    },{ 
      name: "withdraw", 
      description: "Rút tiền khỏi ngân hàng và chuyển nó vào ví tiền", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "amount", 
        description: "bạn muốn rút bao nhiêu tiền", 
        type: ApplicationCommandOptionType.Number,
        require: true,
      }],
    },
  ],
  run: async(client, interaction) => {
    if(interaction.options.getSubcommand() === "cash") {
      const user = interaction.options.getUser("user") || interaction.user;
      const cash = await client.cs.balance({
        guild: { id: null },
        user: user,
      });
      return interaction.reply({ content: `${user.username}, Bạn có ${await client.cs.formatter(cash.wallet)} trong ví và ${await client.cs.formatter(cash.bank)} trong ngân hàng` });
    } else if(interaction.options.getSubcommand() === "transfermoney") {
      const user = interaction.options.getuser("user");
      const amount = interaction.options.getUser("amount");
      if(String(amount).includes("-")) return interaction.reply("Bạn không thể gửi tiền âm.")
      let result = await client.cs.transferMoney({
        user: interaction.user,
        user2: user,
        guild: { id: null },
        amount: amount
      });
      try {
        if(result.error) {
          return interaction.reply({ content: `Bạn không có đủ tiền trong ví.` });
        } else interaction.reply({ 
          content: `**${interaction.user.username}**, Đã chuyển thành công **${await client.cs.formatter(result.money)}** cho **${result.user2.username}**`
        });
      } catch(ex) {
        return interaction.reply({ content: "Thành viên chưa có trong cơ sở dữ liệu, Đã tạo dữ liệu thành viên :))" });
      };
    } else if(interaction.options.getSubcommand() === "deposite") {
      let deposite = await client.cs.deposite({
        user: interaction.user,
        guild: { id: null },
        amount: interaction.options.getNumber("amount"),
      });
      if(deposite.error) {
        if(deposite.type === "money") return interaction.reply({ content: "Chỉ định số tiền gửi" });
        if(deposite.type === "negative-money") return interaction.reply({ content: "Bạn không thể gửi tiền âm" });
        if(deposite.type === "low-money") return interaction.reply({ content: "Bạn không có nhiều tiền trong ví." });
        if(deposite.type === "no-money") return interaction.reply({ content: "Bạn không có tiền để ký gửi" });
        if(deposite.type === "bank-full") return interaction.reply({ content: "Ngân hàng của bạn đã đầy. Nó đã đạt đến giới hạn của nó." });
      } else {
        if(deposite.type === "all-success") return interaction.reply({ content: "Bạn đã gửi tất cả tiền của bạn vào ngân hàng của bạn" + `\nBây giờ bạn đã có ${await client.cs.formatter(deposite.rawData.wallet)} Trong ví của mình và ${await client.cs.formatter(deposite.rawData.bank)} trong ngân hàng của bạn.` });
        if(deposite.type === "success") return interaction.reply({ content: `Bạn đã gửi ${await client.cs.formatter(deposite.amount)} tiền vào ngân hàng của mình.\nBây giờ, bạn đã có ${await client.cs.formatter(deposite.rawData.wallet)} trong ví của mình và ${await client.cs.formatter(deposit.rawData.bank)} trong ngân hàng của bạn.` });
      };
    } else if(interaction.options.getSubcommand() === "withdraw") {
      let result = await client.cs.withdraw({
        user: interaction.user,
        guild: { id: null },
        amount: interaction.options.getNumber("amount"),
      });
      if(result.error) {
        if(result.type === "money") return interaction.reply("Chỉ định số tiền cần rút");
        if(result.type === "negative-money") return interaction.reply("Bạn không thể rút tiền âm, vui lòng sử dụng lệnh gửi tiền");
        if(result.type === "low-money") return interaction.reply("Bạn không có nhiều tiền trong ngân hàng.");
        if(result.type === "no-money") return interaction.reply("Bạn không có tiền để rút");
      } else {
        if(result.type === "all-success") return interaction.reply("Bạn đã rút hết tiền từ ngân hàng của bạn" + `\nBây giờ bạn đã có ${await client.cs.formatter(result.rawData.wallet)} Trong ví và ${await client.cs.formatter(result.rawData.bank)} trong ngân hàng của bạn.`);
        if(result.type === "success") return interaction.reply(`Bạn đã rút ${await client.cs.formatter(result.amount)} từ ngân hàng.\nBây giờ, bạn có ${await client.cs.formatter(result.rawData.wallet)} trong ví và ${await client.cs.formatter(result.rawData.bank)} trong ngân hàng của bạn.`);
      };
    } else if(interaction.options.getSubcommand() === "rob") {
      const user = interaction.options.getUser("user");
      if(user.bot) return interaction.reply({ content: "Người dùng này là bot." });
      let results = await client.cs.rob({
        user: interaction.user,
        user2: user,
        guild: { id: null },
        minAmount: 100,
        successPercentage: 5,
        cooldown: 25, //25 giây,
        maxRob: 1000
      });
      if(results.error) {
        if(results.type === 'time') return interaction.reply({ content: `Gần đây bạn đã bị cướp Thử lại sau ${results.time}` });
        if(results.type === 'low-money') return interaction.reply({ content: `Bạn cần ít nhất ${await client.cs.formatter(results.minAmount)} cướp ai đó.` });
        if(results.type === 'low-wallet') return interaction.reply({ content: `${results.user2.username} có ít hơn ${await client.cs.formatter(results.minAmount)} để cướp.` });
        if(results.type === 'caught') return interaction.reply({ content: `${interaction.user.username} đã cướp ${result.user2.username} và đã bị bắt và đã phải trả lại ${await client.cs.formatter(results.amount)} cho ${results.user2.username}!` });
      } else {
        if(results.type === 'success') return interaction.reply({ content: `${interaction.user.username} bạn bị cướp bởi ${results.user2.username} và đã bị cướp mất ${await client.cs.formatter(results.amount)}` });
      };
    } else if(interaction.options.getSubcommand() === "leaderboard") {
      let data = await client.cs.globalLeaderboard();
      if(data.length < 1) return interaction.reply("Chưa có ai trong bảng xếp hạng.");
      const msg = new EmbedBuilder();
      msg.setTitle("Bảng xếp hàng người có tiền");
      msg.setColor("Random");
      let pos = 0;
      data.slice(0, 10).map(async(e) => {
        pos++;
        msg.addFields({ name: `${pos} - **${e.userName}**`, value: `Wallet: **${e.wallet}** - Bank: **${e.bank}**`, inline: true });
      });
      return interaction.reply({ embeds: [msg] }).catch(() => { });
    };
    moneyEvents(client, interaction);
  },
};

async function moneyEvents(client, interaction) {
  let response, result;
  if(interaction.options.getSubcommand() === "beg") {
      result = await client.cs.beg({
        user: interaction.user,
        guild: { id: null },
        minAmount: 100,
        maxAmount: 1000,
        cooldown: 10 // 10 giây
      });
  } else if(interaction.options.getSubcommand() === "daily") {
      result = await client.cs.daily({
        user: interaction.user,
        guild: { id: null },
        amount: 100,
      });
  } else if(interaction.options.getSubcommand() === "hafly") {
      result = await client.cs.hafly({
        user: interaction.user,
        guild: { id: null },
        amount: 100,
      });
  } else if(interaction.options.getSubcommand() === "hourly") {
      result = await client.cs.hourly({
        user: interaction.user,
        guild: { id: null },
        amount: 100,
      });
  } else if(interaction.options.getSubcommand() === "monthly") {
      result = await client.cs.monthly({
        user: interaction.user,
        guild: { id: null },
        amount: 6000,
      });
  } else if(interaction.options.getSubcommand() === "quaterly") {
      result = await client.cs.quaterly({
        user: interaction.user,
        guild: { id: null },
        amount: 100,
      });
  } else if(interaction.options.getSubcommand() === "weekly") {
      result = await client.cs.weekly({
        user: interaction.user,
        guild: { id: null },
        amount: 100,
      });
  } else if(interaction.options.getSubcommand() === "yearly") {
      result = await client.cs.yearly({
        user: interaction.user,
        guild: { id: null },
        amount: 27000,
      });
  } else if(interaction.options.getSubcommand() === "") {
      result = await client.cs.work({
        user: interaction.user,
        guild: { id: null },
        maxAmount: 500,
        replies: ['Programmer', 'Builder', 'Waiter', 'Busboy', 'Chief', 'Mechanic'],
        cooldown: 25 //25 giây,
      });
  };
    
  if(result.error) {
    response = `Gần đây bạn đã sử dụng lệnh này. Hãy thử lại sau ${result.time}`;
  } else {
    response = `${result.workType ? `Bạn đã làm việc như một ${result.workType} và kiếm được ` : `Bạn đã kiếm được.`} ${await client.cs.formatter(result.amount)}.`;
  };
  return interaction.reply({ 
    content: response 
  });
};