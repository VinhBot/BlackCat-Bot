const { EmbedBuilder } = require("discord.js");
const { afkSchema } = require(`${process.cwd()}/Assets/Schemas/database`);

module.exports = {
	eventName: "messageCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, message) => {
    if(message.author.bot) return;
    const afkcheck = await afkSchema.findOne({ GuildId: message.guild.id, UserId: message.author.id });
    if(afkcheck) {
        const nick = afkcheck.Nickname;
        await afkSchema.deleteMany({
            GuildId: message.guild.id,
            UserId: message.author.id
        });
        await message.member.setNickname(`${nick}`).catch((err) => {
          return console.log(err);
        });
        const m1 = await message.reply({ content: `Này, bạn đã ** trở lại **!`, ephemeral: true });
        setTimeout(() => {
          m1.delete();
        }, 4000);
    } else {
        const members = message.mentions.users.first();
        if(!members) return;
        const afkData = await afkSchema.findOne({ GuildId: message.guild.id, UserId: members.id });
        if(!afkData) return;
        const member = message.guild.members.cache.get(members.id);
        const msg = afkData.Message;
        if(message.content.includes(members)) {
            const m = await message.reply({ content: `${member.user.tag} hiện đang AFK\n> **Lý do**: ${msg}`, ephemeral: true });
            setTimeout(() => {
              m.delete();
              message.delete();
            }, 4000);
        };
    };
  },
};