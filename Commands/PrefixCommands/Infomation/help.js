const { ButtonBuilder, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require("discord.js");
const { readdirSync } = require('fs');
const path = require("node:path");

module.exports = {
    name: path.parse(__filename).name,
    usage: `${path.parse(__filename).name}`,
    aliases: ["cmd", "h"], // lệnh phụ
    description: "Hiển thị danh sách lệnh", // mô tả lệnh
    userPerms: [], // Administrator, ....
    owner: false, //: tắt // true : bật
    category:"Infomation", // tên folder chứa lệnh
    cooldown: 5, // thời gian có thể tái sử dụng lệnh
    run: async(client, message, args, prefix) => {
        if(!args[0]) {
            const categories = readdirSync(`./Commands/PrefixCommands/`);
            const embed = new EmbedBuilder()
                .setAuthor({ name: `❯ ・ Commands list - ${client.commands.size} Commands`, iconURL: client.user.displayAvatarURL() })
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setColor("Random")
            for (const category of categories) {
                const commands = client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``).join(", ", "\n");
                embed.addFields({ name: `${(category)} Commands`, value: `> ${commands}`, inline: false });
            };
            return message.channel.send({ embeds: [embed] });
        } else {
            const command = client.commands.get(args[0].toLowerCase()) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0].toLowerCase()));
            if(!command) return message.channel.send({ 
               content: "Ồ có vẻ như tôi không có lệnh đó"
            });
            return message.channel.send({ embeds: [new EmbedBuilder()
                .setTitle("Chi tiết lệnh:")
                .setThumbnail('https://hzmi.xyz/assets/images/question_mark.png')
                .addFields({ name: "Tên lệnh:", value: command.name ? `\`${command.name}\`` : "Không có tên cho lệnh này.", inline: true })
                .addFields({ name: "Sử dụng:", value: command.usage ? `\`${command.usage}\`` : `\`${prefix}${command.name}\``, inline: true })
                .addFields({ name: 'Lệnh Phụ', value: command.aliases ? command.aliases.join(", ") : "không có lệnh phụ.", inline: true })
                .addFields({ name: "Mô tả lệnh:", value: command.description ? command.description : "Không có mô tả cho lệnh này.", inline: true })
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setColor("Random")]
            });    
        };
    },
};