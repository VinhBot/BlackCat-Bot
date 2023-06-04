const { Collection } = require("discord.js");
const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);
let voiceManager = new Collection();
module.exports = {
	eventName: "voiceStateUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, oldState, newState) => {
    return database.findOne({ GuildId: oldState.guild.id, GuildName: oldState.guild.name }).then(async(getData) => {
      if(!getData) return;
      const channel = oldState.guild.channels.cache.find((channel) => {
        return channel.id === getData.ChannelAutoCreateVoice;
      });
      if(!channel) return;
      const { member, guild } = oldState;
      const newChannel = newState.channel;
      const oldChannel = oldState.channel;
      if(oldChannel !== newChannel && newChannel && newChannel.id === channel.id) {
            const voiceChannel = await guild.channels.create({
                name: `${member.user.tag}`,
                type: ChannelType.GuildVoice,
                parent: newChannel.parent,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: ["Connect", "ManageChannels"],
                    },
                    {
                        id: guild.id,
                        allow: ["Connect"],
                    },
                ],
                userLimit: 30
            });
            voiceManager.set(member.id, voiceChannel.id);
            await newChannel.permissionOverwrites.edit(member, {
                Connect: false
            });
            setTimeout(() => {
                newChannel.permissionOverwrites.delete(member);
            }, 30000);
            return setTimeout(() => {
                member.voice.setChannel(voiceChannel);
            }, 500);
      };
      const jointocreate = voiceManager.get(member.id);
      const members = oldChannel?.members.filter((m) => !m.user.bot).map((m) => m.id);
      if(jointocreate && oldChannel.id === jointocreate && (!newChannel || newChannel.id !== jointocreate)) {
      if(members.length > 0) {
                let randomID = members[Math.floor(Math.random() * members.length)];
                let randomMember = guild.members.cache.get(randomID);
                randomMember.voice.setChannel(oldChannel).then((v) => {
                    oldChannel.setName(randomMember.user.username).catch((e) => null);
                    oldChannel.permissionOverwrites.edit(randomMember, {
                        Connect: true,
                        ManageChannels: true
                    });
                });
                voiceManager.set(member.id, null);
                voiceManager.set(randomMember.id, oldChannel.id);
      } else {
        voiceManager.set(member.id, null);
        oldChannel.delete().catch((e) => null);
      };
    };
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
  },
};