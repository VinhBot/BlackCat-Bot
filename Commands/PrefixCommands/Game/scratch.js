const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } = require("discord.js");
const path = require("node:path");
const config = require(`${process.cwd()}/config.json`);
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["vecao", "soso"], // lệnh phụ
  description: "", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
      let user = await client.cs.balance({ 
        user: message.author
      });
      const checkMoney = new EmbedBuilder()
        .setColor("Random")
        .setTimestamp()
        .setDescription(`Sử dụng lệnh không hợp lệ\nVui lòng sử dụng ${prefix + path.parse(__filename).name} <Số tiền>`)
      let moneyEarned = parseInt(args[0]);
      if(moneyEarned > user.wallet) return message.reply({ embeds: [checkMoney.setDescription("Bạn không có nhiều tiền trong ví của mình")]});
      if(!moneyEarned) return message.reply({ embeds: [checkMoney] });
      if(moneyEarned < 1) return message.reply({ embeds: [checkMoney.setDescription("Vui lòng chỉ định một số cao hơn \`1\`")]});
      if(moneyEarned > 30000) return message.reply({ embeds: [checkMoney.setDescription("Vui lòng chỉ định một số nhỏ hơn \`30.000\`")]});
      if(isNaN(args[0])) return message.reply({ embeds: [checkMoney.setDescription("Vui lòng chỉ định một số hợp lệ!")]});
      await client.cs.removeMoney({
        user: message.author,
        amount: moneyEarned,
      });
    
      let clicks = 3;
      let options = {
        ic: '💵',
        jc: '🧧'
      };
      
      let positions = [
        {
          r: new ButtonBuilder({
            emoji: {
              name: `${options.ic}`
            },
            style: ButtonStyle.Success,
            custom_id: 'r1',
            disabled: true
          }),
          a: new ButtonBuilder({
            label: `-`,
            style: ButtonStyle.Secondary,
            custom_id: 'a1'
          }),
        },
        {
          r: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Danger).setCustomId("r2").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a2"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.ic}`).setStyle(ButtonStyle.Success).setCustomId("r3").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a3"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.ic}`).setStyle(ButtonStyle.Success).setCustomId("r4").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a4"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.jc}`).setStyle(ButtonStyle.Success).setCustomId("r5").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a5"),
        },
        {
          r: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Danger).setCustomId("r6").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a6"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.ic}`).setStyle(ButtonStyle.Success).setCustomId("r7").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a7"),
        },
        {
          r: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Danger).setCustomId("r8").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a8"),
        },
        {
          r: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Danger).setCustomId("r9").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a9"),
        },
        {
          r: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Danger).setCustomId("r10").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a10"),
        },
        {
          r: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Danger).setCustomId("r11").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a11"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.ic}`).setStyle(ButtonStyle.Success).setCustomId("r12").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a12"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.ic}`).setStyle(ButtonStyle.Success).setCustomId("r13").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a13"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.ic}`).setStyle(ButtonStyle.Success).setCustomId("r14").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a14"),
        },
        {
          r: new ButtonBuilder().setEmoji(`${options.ic}`).setStyle(ButtonStyle.Success).setCustomId("r15").setDisabled(true),
          a: new ButtonBuilder().setLabel("-").setStyle(ButtonStyle.Secondary).setCustomId("a15"),
        },
      ];
    
      function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
      };
      positions = shuffle(positions);
      let row1 = new ActionRowBuilder().addComponents(positions[0].a, positions[1].a, positions[2].a);
      let row2 = new ActionRowBuilder().addComponents(positions[3].a, positions[4].a, positions[5].a);
      let row3 = new ActionRowBuilder().addComponents(positions[6].a, positions[7].a, positions[8].a);
      let row4 = new ActionRowBuilder().addComponents(positions[9].a, positions[10].a, positions[11].a);
      let row5 = new ActionRowBuilder().addComponents(positions[12].a, positions[13].a, positions[14].a);
      let embed = new EmbedBuilder()
        .setColor("Random")
        .setTimestamp()
        .setTitle(`${message.author.username} kiếp đỏ đen`)
        .setDescription(`Tiền cược: **${moneyEarned.toLocaleString()}₫**\nBạn còn: **${clicks}** lượt cào số.`)
      let msg = await message.reply({ embeds: [embed], components: [row1, row2, row3, row4, row5] })
      let collector = msg.createMessageComponentCollector({ 
        ComponentType: ComponentType.Button,
        filter: (i) => i.user.id === message.author.id,
        time: 120000, 
        max: 3 
      });
      collector.on('collect', async (i) => {
        if (!i.isButton()) return;
        i.deferUpdate();
        let used = positions.find((x) => x.a.custom_id === i.customId);
        const ButtonStyles = ["Danger", "Success", "Primary"];
        if(used.r.style === ButtonStyles[0]) {
          let moneylost = moneyEarned * 0.25;
          moneyEarned -= Math.trunc(moneylost);
          clicks -= 1;
        } else if(used.r.style === ButtonStyles[1]) {
          let moneywon = moneyEarned * 0.09;
          moneyEarned += Math.trunc(moneywon);
          clicks -= 1;
        } else if(used.r.style === ButtonStyle[2]) {
          let moneyjackpot = moneyEarned * 8.99;
          moneyEarned += moneyjackpot;
          clicks -= 1;
        };
        used.a = used.r;
        embed = new EmbedBuilder()
          .setColor('Random')
          .setTitle(`${message.author.username } kiếp đỏ đen`)
          .setTimestamp()
          .setDescription(`Tiền thắng: **${moneyEarned.toLocaleString()}₫ ** \nBạn có: **${clicks}** lần cào nữa.`)
        msg.edit({ 
          embeds: [embed], 
          components: [
            new ActionRowBuilder().addComponents(positions[0].a, positions[1].a, positions[2].a),
            new ActionRowBuilder().addComponents(positions[3].a, positions[4].a, positions[5].a),
            new ActionRowBuilder().addComponents(positions[6].a, positions[7].a, positions[8].a),
            new ActionRowBuilder().addComponents(positions[9].a, positions[10].a, positions[11].a),
            new ActionRowBuilder().addComponents(positions[12].a, positions[13].a, positions[14].a),
          ]
        });
      });
      collector.on('end', async() => {
        positions.forEach((g) => {
          g.a = g.r
          row1 = new ActionRowBuilder().addComponents(positions[0].a, positions[1].a, positions[2].a)
          row2 = new ActionRowBuilder().addComponents(positions[3].a, positions[4].a, positions[5].a)
          row3 = new ActionRowBuilder().addComponents(positions[6].a, positions[7].a, positions[8].a)
          row4 = new ActionRowBuilder().addComponents(positions[9].a, positions[10].a, positions[11].a)
          row5 = new ActionRowBuilder().addComponents(positions[12].a, positions[13].a, positions[14].a)
        });
        const money = (`${Math.trunc(moneyEarned)}`);
        await client.cs.addMoney({
          user: message.author.id,
          amount: money,
        });
        embed = new EmbedBuilder()
          .setDescription(`Bạn đã cào được: **${moneyEarned.toLocaleString()}₫ **\nBạn đã nhận được: **${money}**`)
          .setColor("Random")
          .setTitle(`${message.author.username } kiếp đỏ đen`)
          .setTimestamp()
        msg.edit({
          embeds: [embed],
          components: [
            row1,
            row2,
            row3,
            row4,
            row5
          ]
        });
      });
    },
};
