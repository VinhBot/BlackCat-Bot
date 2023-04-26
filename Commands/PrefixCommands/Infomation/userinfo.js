const { EmbedBuilder } = require("discord.js");
const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "Xem thông tin của thành viên", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Infomation", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    try {
      const member = message.guild.members.cache.get(message.mentions.members.first().id || message.member);
      if(!member) return;
      const badgeFlags = {
        DEVELOPER: "👨‍💻",
        BUGS: "🐛",
        MANAGEMENT: "👑",
        PREMIUM: "👑",
        SUPPORTER: "👨‍🔧",
        TEAM: "👨‍👩‍👧‍👦",
        BOOSTER: "🚀",
        PARTNER: "🤝",
        VOTER: "🗳️",
        SUPPORT: "🔧",
        MODERATOR: "👮‍♂️",
        DESIGNER: "🎨",
        MARKETING: "📈"
      };
      const flags = {
        ActiveDeveloper: "👨‍💻・Active Developer",
        BugHunterLevel1: "🐛・Discord Bug Hunter",
        BugHunterLevel2: "🐛・Discord Bug Hunter",
        CertifiedModerator: "👮‍♂️・Certified Moderator",
        HypeSquadOnlineHouse1: "🏠・House Bravery Member",
        HypeSquadOnlineHouse2: "🏠・House Brilliance Member",
        HypeSquadOnlineHouse3: "🏠・House Balance Member",
        HypeSquadEvents: "🏠・HypeSquad Events",
        PremiumEarlySupporter: "👑・Early Supporter",
        Partner: "👑・Partner",
        Quarantined: "🔒・Quarantined", // Không chắc chắn cái này còn hoạt động :))
        Spammer: "🔒・Spammer", // Không chắc chắn cái này còn hoạt động :)
        Staff: "👨‍💼・Discord Staff",
        TeamPseudoUser: "👨‍💼・Discord Team",
        VerifiedBot: "🤖・Verified Bot",
        VerifiedDeveloper: "👨‍💻・(early)Verified Bot Developer",
      };
      const roles = member.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString()).slice(0, -1);
      const userFlags = member.user.flags ? member.user.flags.toArray() : [];

      return message.reply({ embeds: [new EmbedBuilder()
        .setTitle("Xem thông tin người dùng")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setDescription(`Thông tin về ${member.user.username}`)
        .setImage(member.user.bannerURL({ dynamic: true, size: 1024 }))
        .addFields([
          { name: "tên thành viên", value: `${member.user.username}`, inline: true },
          { name: "Số định danh", value: `${member.user.discriminator}`, inline: true },
          { name: "Biệt danh", value: `${member.nickname || 'không có biệt danh'}`, inline: true },
          { name: "Id", value: `${member.user.id}`, inline: true },
          { name: "Huy hiệu của thành viên", value: `${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Không có'}`, inline: true },
          { name: "Ngày tham gia discord", value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true },
          { name: "Ngày tham gia server", value: `<t:${Math.round(member.joinedAt / 1000)}>`, inline: true },
          { name: `Roles [${roles.length}]`, value: `${roles.length ? roles.join(', ') : 'Không có'}`, inline: false }
        ])                     
      ]});
    } catch(e) {
      return message.reply({ content: "Bạn quên vẫn chưa ping một ai đó" });
    }
  },
};