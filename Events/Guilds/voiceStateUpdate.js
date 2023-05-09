const { ChannelType, Collection } = require("discord.js");
const { Database } = require("st.db");
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});
let voiceManager = new Collection();

module.exports = {
	eventName: "voiceStateUpdate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, oldState, newState) => {
    /*========================================================
    # create voice
    ========================================================*/
    const { member, guild } = oldState;
    const getData = await database.get(guild.id);
    if(!getData) return;
    if(getData) {
        let guilds = client.guilds.cache.get(getData.defaultGuildId);
        let channel = guilds.channels.cache.get(getData.setDefaultMusicData.ChannelAutoCreateVoice);
        const newChannel = newState.channel;
        const oldChannel = oldState.channel;
        if(!channel) return;
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
        }
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
        }
    };
    /*========================================================
    # nhật ký
    ========================================================*/
    let guilds = client.guilds.cache.get(getData.defaultGuildId);
    let channels = guilds.channels.cache.get(getData.setDiaryChannel.voiceStateUpdate);
    if(!channels) return;
    let oldUser = oldState.member;
    let newUser = newState.member;
    if(oldUser.voice.channelId !== newUser.voice.channelId && newUser.voice.channelId !==  null || undefined) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã tham gia kênh voice <#${newUser.voice.channelId}>`)
            .setColor("Yellow")
            .setTimestamp()
          ] 
        }).catch((ex) => console.log(ex));
    } else if(oldUser.voice.channelId !== newUser.voice.channelId && newUser.voice.channelId ===  null || undefined) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} rời khỏi kênh voice <#${oldUser.voice.channelId}>`)
            .setColor("Yellow")
            .setTimestamp()
          ]
        }).catch((ex) => console.log(ex));
    } else if(oldState.mute !== newState.mute) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã ${newState.mute ? "tắt tiếng" : "bật tiếng"}`)
            .setColor("Yellow")
            .setTimestamp()
          ] 
        }).catch((ex) => console.log(ex));
    } else if(oldState.deaf !== newState.deaf) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã ${newState.deaf ? "tắt âm thanh" : "bật âm thanh"}`)
            .setColor("Yellow")
            .setTimestamp()
          ] 
        }).catch((ex) => console.log(ex));
    };
  },
};