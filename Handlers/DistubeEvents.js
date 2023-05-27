const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { DisTube } = require("distube");
const { Database } = require("st.db");
const playerintervals = new Map();
const PlayerMap = new Map();
const maps = new Map();
let songEditInterval = null;
let lastEdited = false;
// Json Data
const { disspace, MusicRole } = require("../Events/functions");
const config = require(`${process.cwd()}/config.json`);
const database = new Database("./Assets/Database/defaultDatabase.json", { 
  databaseInObject: true 
});
const autoresume = new Database("./Assets/Database/autoresumeDatabase.json", { 
  databaseInObject: true 
});
// export module :))) 
module.exports = (client) => {
  const distube = new DisTube(client, {
    searchSongs: 0,
	  searchCooldown: 30,
	  leaveOnEmpty: true,
	  emptyCooldown: 25,
    savePreviousSongs: true, 
	  leaveOnFinish: false,
	  leaveOnStop: false,
	  nsfw: true,
	  plugins: [
      new SpotifyPlugin({ 
        parallel: true, 
        emitEventsAfterFetching: true,
        api: {
          clientId: config.clientId,
          clientSecret: config.clientSecret 
        }
      }),
      new SoundCloudPlugin(),
        new YtDlpPlugin({ update: true })
    ],
    youtubeCookie: config.youtubeCookie,
    ytdlOptions: {
      highWaterMark: 1024 * 1024 * 64,
      quality: "highestaudio",
      format: "audioonly",
      liveBuffer: 60000,
      dlChunkSize: 1024 * 1024 * 4,
      youtubeCookie: config.youtubeCookie,
    },
    emitAddListWhenCreatingQueue: true,
    emitAddSongWhenCreatingQueue: false,
    emitNewSongOnly: true,
  });
  function generateQueueEmbed(queue, guildId, leave) {
    const createBar = (total, current, size = 25, line = "▬", slider = "🌟") => {
      if(!total) return;
      if(!current) return `**[${slider}${line.repeat(size - 1)}]**`;
      let bar = current > total ? [line.repeat(size / 2 * 2), (current / total) * 100] : [line.repeat(Math.round(size / 2 * (current / total))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (current / total)) + 1), current / total];
      if(!String(bar).includes(slider)) {
        return `**[${slider}${line.repeat(size - 1)}]**`;
      } else {
        return `**[${bar[0]}]**`;
      };
    };
    const genshinGif = [
      "https://upload-os-bbs.hoyolab.com/upload/2021/08/12/64359086/ad5f51c6a4f16adb0137cbe1e86e165d_8637324071058858884.gif?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,gif",
      "https://upload-os-bbs.hoyolab.com/upload/2021/08/12/64359086/2fc26b1deefa6d2ff633dda1718d6e5b_6343886487912626448.gif?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,gif",
    ];
    const randomGenshin = genshinGif[Math.floor(Math.random() * genshinGif.length)];
    let guild = client.guilds.cache.get(guildId);
    if(!guild) return;
    let newQueue = client.distube.getQueue(guild.id);
    var embeds = [
      new EmbedBuilder()
      .setColor("Random")
      .setTitle(`📃 hàng đợi của __${guild.name}__`)
      .setDescription("**Hiện tại có 0 Bài hát trong Hàng đợi**")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields({ 
        name: "Bắt đầu nghe nhạc, bằng cách kết nối với Kênh voice và gửi **LIÊN KẾT BÀI HÁT** hoặc **TÊN BÀI HÁT** trong Kênh này!",
        value: "> *Tôi hỗ trợ Youtube, Spotify, Soundcloud và các liên kết MP3 trực tiếp!*", 
        inline: true 
      }),
      new EmbedBuilder()
      .setColor("Random")
      .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
      .setImage(randomGenshin)
    ];
    if(!leave && newQueue && newQueue.songs[0]) {
      embeds[1].setImage(`https://img.youtube.com/vi/${newQueue.songs[0].id}/mqdefault.jpg`)
      .setAuthor({ name: `${newQueue.songs[0].name}`, iconURL: `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`, url: newQueue.songs[0].url })
      .setFooter({ text: `${newQueue.songs[0].user?.tag}`, iconURL: newQueue.songs[0].user?.displayAvatarURL({ dynamic: true }) })
      .addFields(
        { name: `🔊 Âm lượng:`, value: `>>> \`${newQueue.volume} %\``, inline: true },
        { name: `${newQueue.playing ? `♾ Vòng lặp:` : `⏸️ Đã tạm dừng:`}`, value: newQueue.playing ? `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `✔️ Hàng đợi` : `✔️ \`Bài hát\`` : `❌`}` : `>>> ✔️`, inline: true },
        { name: `❔ Filters:`, value: `>>> ${newQueue.filters.names.join(", ") || "❌"}`, inline: true },
        { name: `⏱ Thời gian:`, value: `\`${newQueue.formattedCurrentTime}\` ${createBar(newQueue.songs[0].duration, newQueue.currentTime, 13)} \`${newQueue.songs[0].formattedDuration}\``, inline: true },
        { name: `💡 Yêu cầu bởi:`, value: `>>> ${newQueue.songs[0].user}`, inline: true }
      )
      var maxTracks = 10; // bài hát / Trang hàng đợi
      embeds[0] = new EmbedBuilder()
      .setTitle(`📃 hàng đợi của __${guild.name}__ - [${newQueue.songs.length} bài hát]`)
      .setColor("Random")
      .setDescription(String(newQueue.songs.slice(0, maxTracks).map((track, index) => `**\` ${++index}. \` ${track.url ? `[${track.name.substr(0, 60).replace(/\[/igu, `\\[`).replace(/\]/igu, `\\]`)}](${track.url})` : track.name}** - \`${track.isStream ? "Trực Tiếp" : track.formattedDuration}\`\n> *Được yêu cầu bởi: __${track.user?.tag}__*`).join(`\n`)).substr(0, 2048));
      if(newQueue.songs.length > 10)
      embeds[0].addFields({ name: `**\` N. \` *${newQueue.songs.length > maxTracks ? newQueue.songs.length - maxTracks : newQueue.songs.length} các bản nhạc khác ...***`, value: `\u200b` })
      embeds[0].addFields({ name: `**\` 0. \` __THEO DÕI HIỆN TẠI__**`, value: `**${newQueue.songs[0].url ? `[${newQueue.songs[0].name.substr(0, 60).replace(/\[/igu, `\\[`).replace(/\]/igu, `\\]`)}](${newQueue.songs[0].url})` : newQueue.songs[0].name}** - \`${newQueue.songs[0].isStream ? "Trực Tiếp" : newQueue.formattedCurrentTime}\`\n> *Được yêu cầu bởi: __${newQueue.songs[0].user?.tag}__*` })
    };
    var Emojis = [`0️⃣`, `1️⃣`];
    var stopbutton = new ButtonBuilder().setStyle('Danger').setCustomId('Stop').setEmoji(`🏠`).setLabel("Dừng phát").setDisabled()
    var skipbutton = new ButtonBuilder().setStyle('Primary').setCustomId('Skip').setEmoji(`⏭`).setLabel("Bỏ qua").setDisabled();
    var shufflebutton = new ButtonBuilder().setStyle('Primary').setCustomId('Shuffle').setEmoji('🔀').setLabel("Xáo trộn").setDisabled();
    var pausebutton = new ButtonBuilder().setStyle('Secondary').setCustomId('Pause').setEmoji('⏸').setLabel("Tạm dừng").setDisabled();
    var autoplaybutton = new ButtonBuilder().setStyle('Success').setCustomId('Autoplay').setEmoji('🔁').setLabel("Tự động phát").setDisabled();
    var songbutton = new ButtonBuilder().setStyle('Success').setCustomId('Song').setEmoji(`🔁`).setLabel("Bài hát").setDisabled();
    var queuebutton = new ButtonBuilder().setStyle('Success').setCustomId('Queue').setEmoji(`🔂`).setLabel("Hàng đợi").setDisabled();
    var forwardbutton = new ButtonBuilder().setStyle('Primary').setCustomId('Forward').setEmoji('⏩').setLabel("+10 Giây").setDisabled();
    var rewindbutton = new ButtonBuilder().setStyle('Primary').setCustomId('Rewind').setEmoji('⏪').setLabel("-10 Giây").setDisabled();
    var volumeupbutton = new ButtonBuilder().setStyle("Primary").setCustomId("VolumeUp").setEmoji("🔊").setLabel("+10").setDisabled();
    var volumedownbutton = new ButtonBuilder().setStyle("Primary").setCustomId("VolumeDown").setEmoji("🔉").setLabel("-10").setDisabled();
    var lyricsbutton = new ButtonBuilder().setStyle('Primary').setCustomId('Lyrics').setEmoji('📝').setLabel("Lời nhạc").setDisabled();
    if(!leave && newQueue && newQueue.songs[0]) {
      skipbutton = skipbutton.setDisabled(false);
      shufflebutton = shufflebutton.setDisabled(false);
      stopbutton = stopbutton.setDisabled(false);
      songbutton = songbutton.setDisabled(false);
      queuebutton = queuebutton.setDisabled(false);
      forwardbutton = forwardbutton.setDisabled(false);
      rewindbutton = rewindbutton.setDisabled(false);
      autoplaybutton = autoplaybutton.setDisabled(false);
      pausebutton = pausebutton.setDisabled(false);
      lyricsbutton = lyricsbutton.setDisabled(false);
      volumeupbutton = volumeupbutton.setDisabled(false);
      volumedownbutton = volumedownbutton.setDisabled(false);
      if(newQueue.autoplay) {
        autoplaybutton = autoplaybutton.setStyle('Secondary')
      } else if(newQueue.paused) {
        pausebutton = pausebutton.setStyle('Success').setEmoji('▶️').setLabel("Tiếp tục");
      };
      if(newQueue.repeatMode === 1) {
        songbutton = songbutton.setStyle('Secondary');
        queuebutton = queuebutton.setStyle('Success');
      } else if(newQueue.repeatMode === 2) {
        songbutton = songbutton.setStyle('Success');
        queuebutton = queuebutton.setStyle('Secondary');
      } else {
        songbutton = songbutton.setStyle('Success');
        queuebutton = queuebutton.setStyle('Success');
      };
    };
    //bây giờ chúng tôi thêm các thành phần!
    return {
      embeds,
      components: [
         new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId("StringSelectMenuBuilder").addOptions([`Gaming`, `NCS | No Copyright Music`].map((t, index) => {
           return {
             label: t.substr(0, 25),
             value: t.substr(0, 25),
             description: `Tải Danh sách phát nhạc: '${t}'`.substr(0, 50),
             emoji: Emojis[index]
           };
         }))]),
         new ActionRowBuilder().addComponents([ skipbutton, stopbutton, pausebutton, autoplaybutton, shufflebutton ]),
         new ActionRowBuilder().addComponents([ songbutton, queuebutton, forwardbutton, rewindbutton, lyricsbutton ]),
         new ActionRowBuilder().addComponents([ volumeupbutton, volumedownbutton ]),
      ],
    };                                                                                                           
  };
  const updateMusicSystem = async(queue, leave = false) => {
    const defaultData = await database.get(queue.id);
    const data = defaultData.setDefaultMusicData;
    if(!queue) return;
    if(data.ChannelId && data.ChannelId.length > 5) {
      let guild = client.guilds.cache.get(queue.id);
      if(!guild) return console.log(`Update-Music-System`.brightCyan + ` - Music System - Không tìm thấy Guild!`)
      let channel = guild.channels.cache.get(data.ChannelId);
      if(!channel) channel = await guild.channels.fetch(data.ChannelId).catch(() => {}) || false;
      if(!channel) return console.log(`Update-Music-System`.brightCyan + ` - Music System - Không tìm thấy kênh!`)
      let message = channel.messages.cache.get(data.MessageId);
      if(!message) message = await channel.messages.fetch(data.MessageId).catch(() => {}) || false;
      if(!message) return console.log(`Update-Music-System`.brightCyan + ` - Music System - Không tìm thấy tin nhắn!`)
      message.edit(generateQueueEmbed(client, queue.id, leave)).catch((e) => {
        console.log(e);
      }).then(() => console.log(`- Đã chỉnh sửa tin nhắn do Tương tác của người dùng`));
    };
  };
  /*========================================================
  # Bắt đầu chạy các evnets
  ========================================================*/
  client.distube = distube;
  client.maps = maps;
  distube.on("playSong", async(queue, track) => {
    const defaultData = await database.get(queue.id);
    var newQueue = distube.getQueue(queue.id);
    updateMusicSystem(newQueue);
    const nowplay = await queue.textChannel?.send(disspace(newQueue, track)).then((message) => {
      PlayerMap.set("currentmsg", message.id);
      return message;
    }).catch((e) => console.log(e));
    if(queue.textChannel?.id === defaultData.setDefaultMusicData.ChannelId) return;
    var collector = nowplay?.createMessageComponentCollector({
      filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
      time: track.duration > 0 ? track.duration * 1000 : 600000
    });
    try {clearInterval(songEditInterval)} catch(e) {};
    songEditInterval = setInterval(async() => {
      if(!lastEdited) {
        try {
          var newQueue = distube.getQueue(queue.id);
          await nowplay.edit(disspace(newQueue, newQueue.songs[0])).catch((e) => {});
        } catch(e) {
          clearInterval(songEditInterval);
        };
      };
    }, 4000);
    collector?.on('collect', async(i) => {
      if(MusicRole(client, i.member, client.distube.getQueue(i.guild.id).songs[0])) {
        return i.reply({
          content: `Bạn không có MusicRole hoặc không phải người yêu cầu bài hát\n${MusicRole(client, i.member, client.distube.getQueue(i.guild.id).songs[0])}`, ephemeral: true 
        });         
      };
      lastEdited = true;
      setTimeout(() => lastEdited = false, 7000);
      let { member, guild } = i;
      // if(!member.voice.channel) return i.reply({ content: `❌ **Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
      const test = guild.channels.cache.filter(chnl => (chnl.type == ChannelType.GuildVoice)).find(channel => (channel.members.has(client.user.id)));
      if(test && member.voice.channel.id !== test?.id) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`❌ Tôi đã chơi trong <#${test?.id}>`)], ephemeral: true });
      // bỏ qua bài hát
      if(i.customId == `skip`) {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              if(newQueue.songs.length == 0) {
                  clearInterval(songEditInterval);
                  await distube.stop(i.guild.id);
                  return await i.reply({ embeds: [new EmbedBuilder()
                    .setColor("Random").setTimestamp()
                    .setTitle(`⏹ **Dừng phát nhạc**`)
                    .setFooter({ text: `Yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({ dynamic: true })}`})]
                  }).then((i) => {
                    setTimeout(() => i.interaction.deleteReply(), 3000);
                  }).catch((e) => {});
              };             
              try {
                  await distube.skip(i.guild.id) 
                  await i.reply({ embeds: [new EmbedBuilder()
                     .setColor("Random").setTimestamp()
                     .setTitle(`⏭ **Bỏ qua bài hát!**`)
                     .setFooter({ text: `Yesu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}` })
                  ]}).then((i) => {
                     setTimeout(() => i.interaction.deleteReply(), 3000);
                  }).catch((e) => {});
                  nowplay.edit({ components: [] });
              } catch(error) {
                i.reply({ content: "Hiện tại chỉ có một bài hát trong playlist, bạn cần thêm tối thiểu ít nhất một bài hát nữa ..." }).then((i) => {
                  setTimeout(() => i.interaction.deleteReply(), 3000);
                }).catch((e) => { });
              };
            } else if (i.customId == "stop") {
                if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
                if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
                if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
                nowplay.edit({ components: [] });
                await i.reply({ content: "👌 Đã dừng phát nhạc và rời khỏi kênh voice channel theo yêu cầu" }).then((i) => {
                  setTimeout(() => i.interaction.deleteReply(), 3000);
                }).catch((e) => {});
                await distube.voices.leave(i.guild.id);
            } else if(i.customId == "pause") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              if(newQueue.playing) {
                await distube.pause(i.guild.id);
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
                await i.reply({ embeds: [new EmbedBuilder()
                    .setColor("Random").setTimestamp()
                    .setTitle(`⏸ **Tạm dừng**`)
                    .setFooter({ text: `yêu cầu bởi ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
                }).then((i) => {
                  setTimeout(() => i.interaction.deleteReply(), 3000);
                }).catch((e) => {});
              } else {
                await distube.resume(i.guild.id);
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
                await i.reply({ embeds: [new EmbedBuilder()
                    .setColor("Random").setTimestamp()
                    .setTitle(`▶️ **tiếp tục**`)
                    .setFooter({ text: `Yêu cầu bởi ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
                }).then((i) => {
                  setTimeout(() => i.interaction.deleteReply(), 3000);
                }).catch((e) => {});
              };
            } else if (i.customId == "autoplay") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              await newQueue.toggleAutoplay()
              if(newQueue.autoplay) {
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {});
              } else {
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {});
              };
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor("Random").setTimestamp()
                  .setTitle(`${newQueue.autoplay ? `✔️ **Đã bật chế độ tự động phát**`: `❌ **Đã tắt chế độ tự động phát**`}`)
                  .setFooter({ text: `yêu cầu bởi ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              }).then((i) => {
                setTimeout(() => i.interaction.deleteReply(), 3000);
              }).catch((e) => {});
            } else if(i.customId == "shuffle") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
              await newQueue.shuffle()
              await i.reply({ embeds: [new EmbedBuilder()
                .setColor("Random").setTimestamp()
                .setTitle(`🔀 **Xáo trộn ${newQueue.songs.length} bài hát!**`)
                .setFooter({ text: `YC bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              }).then((i) => {
                setTimeout(() => i.interaction.deleteReply(), 3000);
              }).catch((e) => {});
            } else if(i.customId == "song") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              if(newQueue.repeatMode == 1){
                await newQueue.setRepeatMode(0);
              } else {
                await newQueue.setRepeatMode(1);
              };
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor("Random").setTimestamp()
                  .setTitle(`${newQueue.repeatMode == 1 ? `✔️ **Lặp bài hát đã bật**`: `❌ **Lặp bài hát đã tắt**`}`)
                  .setFooter({ text: `Yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              }).then((i) => setTimeout(() => i.interaction.deleteReply(), 3000)).catch((e) => {});
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {});
            } else if(i.customId == "queue") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              if(newQueue.repeatMode == 2) {
                await newQueue.setRepeatMode(0);
              } else {
                await newQueue.setRepeatMode(2);
              };
              await i.reply({ embeds: [new EmbedBuilder()
                .setColor("Random").setTimestamp()
                .setTitle(`${newQueue.repeatMode == 2 ? `**Lặp hàng đợi đã bật**`: `**Lặp hàng đợi đã tắt**`}`)
                .setFooter({ text: `Yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              }).then((i) => setTimeout(() => i.interaction.deleteReply(), 3000)).catch((e) => {});
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {});
            } else if(i.customId == "seek"){
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              let seektime = newQueue.currentTime + 10;
              if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000 })
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor("Random").setTimestamp()
                  .setTitle(`⏩ **+10 Giây!**`)
                  .setFooter({ text: `yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              }).then((i) => setTimeout(() => i.interaction.deleteReply(), 3000)).catch((e) => {});
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
            } else if(i.customId == "seek2") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor("Random").setTimestamp()
                  .setTitle(`⏪ **-10 Giây!**`)
                  .setFooter({ text: `yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              }).then((i) => setTimeout(() => i.interaction.deleteReply(), 3000)).catch((e) => {});
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
            } else if(i.customId == `lyrics`) {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              try {
                 await i.deferReply();
                 let thumbnail = newQueue.songs.map((song) => song.thumbnail).slice(0, 1).join("\n");
                 let name = newQueue.songs.map((song) => song.name).slice(0, 1).join("\n");
                 i.editReply({ embeds: [new EmbedBuilder()
                  .setAuthor({ name: name, iconURL: thumbnail, url: newQueue.songs.map((song) => song.url).slice(0, 1).join("\n") })
                  .setColor("Random")
                  .setThumbnail(thumbnail)
                  .setDescription((await require("lyrics-finder")(newQueue.songs.map((song) => song.uploader.name).slice(0, 1).join("\n"), name)) || "Không tìm thấy lời bài hát!")
                 ], ephemeral: true });
              } catch(e) {
                  i.reply({ content: `Lỗi: ${e}`, ephemeral: true });
              };
            } else if(i.customId == "volumeUp") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              try {
                const volumeUp = Number(newQueue.volume) + 10;
                if (volumeUp < 0 || volumeUp > 100) return i.reply({
                  embeds: [new EmbedBuilder().setColor("Random").setDescription("Bạn chỉ có thể đặt âm lượng từ 0 đến 100.").setTimestamp()], ephemeral: true 
                });
			          await newQueue.setVolume(volumeUp);
			          await i.reply({ content: `:white_check_mark: | Âm lượng tăng lên ${volumeUp}%` }).then((i) => {
                  setTimeout(() => i.interaction.deleteReply(), 3000);
                });
              } catch (error) {
                console.log(error);
              };
            } else if(i.customId == "volumeDown") {
              if(!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
              if(!distube.getQueue(i.guild.id) || !newQueue.songs || newQueue.songs.length == 0) return await i.reply({ content: "Danh sách nhạc trống" });
              if(member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              
              try {
                const volumeDown = Number(newQueue.volume) - 10;
                const invalidVolume = new EmbedBuilder().setColor("Random").setDescription(":x: | Không thể giảm âm lượng của bạn nữa nếu tiếp tục giảm bạn sẽ không nghe thấy gì").setTimestamp();
                if(volumeDown <= 0) return i.reply({ embeds: [invalidVolume], ephemeral: true });
			          await newQueue.setVolume(volumeDown);
			          await i.reply({ content: `:white_check_mark: | Âm lượng giảm xuống ${volumeDown}%` }).then((i) => {
                  setTimeout(() => i.interaction.deleteReply(), 3000);
                });
              } catch (error) {
                console.log(error);
              };
            };
        });
        collector?.on('end', async(collected, reason) => {
          if(reason === "time") {
            nowplay.edit({ components: [] });
          };
     });
  }).on("finishSong", (queue, song) => {
    return queue.textChannel?.messages?.fetch(PlayerMap.get("currentmsg")).then((msg) => {
      msg.edit({ embeds: [new EmbedBuilder()
            .setAuthor({ name: `${song.name}`, iconURL: "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png", url: song.url })
            .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
            .setFooter({ text: `💯 ${song.user.tag}\n⛔️ Bài hát đã kết thúc!`, iconURL: song.user.displayAvatarURL({ dynamic: true }) })
            .setColor("Random")
       ], components: []}).catch((e) => console.log(e));
    }).catch((e) => console.log(e));
  }).on("finish", async(queue) => {
    return queue.textChannel?.send({ embeds: [new EmbedBuilder().setColor("Random").setDescription("Đã phát hết nhạc trong hàng đợi,.. rời khỏi kênh voice")]}).then((msg) => setTimeout(() => msg.delete(), 10000));
  }).on("addList", async(queue, playlist) => {
      return queue.textChannel?.send({ embeds: [new EmbedBuilder()
        .setTitle("Đã thêm vài hát vào hàng đợi")                                                
        .setColor("Random")
        .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
        .setFooter({ text: `💯 ${playlist.user.tag}`, iconURL: `${playlist.user.displayAvatarURL({ dynamic: true })}`})
        .setDescription(`👍 Danh sách: [\`${playlist.name}\`](${playlist.url ? playlist.url : ``})  -  \`${playlist.songs.length} Bài hát ${playlist.songs.length > 0 ? `` : ``}\``)
        .addFields(
          { name: `**Thời gian dự tính**`, value: `\`${queue.songs.length - - playlist.songs.length} Bài hát${queue.songs.length > 0 ? `` : ``}\` - \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(`.`, `:`)}\``, inline: true },
          { name: `**Thời lượng hàng đợi**`, value: `\`${queue.formattedDuration}\``, inline: true },
        )
      ]}).then((msg) => setTimeout(() => msg.delete(), 11000));
  }).on("addSong", async(queue, song) => {
      return queue.textChannel?.send({ embeds: [new EmbedBuilder()
          .setColor("Random")
          .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
          .setFooter({ text: `💯 ${song.user.tag}`, iconURL: `${song.user.displayAvatarURL({ dynamic: true })}`})
          .setAuthor({ name: `Bài hát đã được thêm!`, iconURL: `${song.user.displayAvatarURL({ dynamic: true })}`, url: `${song.url}` })
          .setDescription(`👍 Bài hát: [${song.name}](${song.url})  -  ${song.formattedDuration}`)
          .addFields([
            { name: `⌛ **Thời gian dự tính**`, value: `\`${queue.songs.length - 1} Bài hát${queue.songs.length > 0 ? `.` : ``}\` - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(`.`, `:`)}\``, inline: true },
            { name: `🎥 Lượt xem`, value: `${(queue.songs[0].views).toLocaleString()}`, inline: true },
            { name: `👍 Likes`, value: `${(queue.songs[0].likes).toLocaleString()}`, inline: true },
            { name: `👎 Dislikes`, value: `${(queue.songs[0].dislikes).toLocaleString()}`, inline: true},
            { name: `🌀 **Thời lượng hàng đợi**`, value: `\`${queue.formattedDuration}\``, inline: true },
          ])
      ]}).then((msg) => setTimeout(() => msg.delete(), 30000));
  }).on("deleteQueue", async(queue) => {
    var newQueue = client.distube.getQueue(queue.id);
    if(!PlayerMap.has(`deleted-${queue.id}`)) {
          PlayerMap.set(`deleted-${queue.id}`, true);
          if(maps.has(`beforeshuffle-${queue.id}`)){
            maps.delete(`beforeshuffle-${newQueue.id}`);
          };
          try {
            //Xóa khoảng thời gian để kiểm tra hệ thống thông báo liên quan
            clearInterval(playerintervals.get(`checkrelevantinterval-${queue.id}`))
            playerintervals.delete(`checkrelevantinterval-${queue.id}`);
            // Xóa Khoảng thời gian cho trình tiết kiệm hồ sơ tự động
            clearInterval(playerintervals.get(`autoresumeinterval-${queue.id}`))
            if(autoresume.has(queue.id)) autoresume.delete(queue.id); //Xóa db nếu nó vẫn ở đó
            playerintervals.delete(`autoresumeinterval-${queue.id}`);
            // Xóa khoảng thời gian cho Hệ thống Embed Chỉnh sửa Nhạc
            clearInterval(playerintervals.get(`musicsystemeditinterval-${queue.id}`))
            playerintervals.delete(`musicsystemeditinterval-${queue.id}`);
          } catch(e) {
            console.log(e);
          };
          updateMusicSystem(queue, true);
          queue.textChannel?.send({ embeds: [new EmbedBuilder().setColor("Random")
              .setTitle(`⛔️`)
              .setDescription(`:headphones: **Hàng đợi đã bị xóa**`)
              .setTimestamp()
          ]}).catch((ex) => {});
    };
  }).on("initQueue", async(queue) => {
    var newQueue = client.distube.getQueue(queue.id);
    const defaultData = await database.get(queue.id);
    if(!defaultData) return;
    const data = defaultData.setDefaultMusicData;
    let channelId = data.ChannelId;
    let messageId = data.MessageId;
    if(PlayerMap.has(`deleted-${queue.id}`)) {
      PlayerMap.delete(`deleted-${queue.id}`)
    };
    queue.autoplay = Boolean(data.DefaultAutoplay);
    queue.volume = Number(data.DefaultVolume);
    queue.filters.set(data.DefaultFilters);
    queue.voice.setSelfDeaf(true); 
    /** 
     * Kiểm tra các thông báo có liên quan bên trong Kênh yêu cầu hệ thống âm nhạc
     */
    var checkrelevantinterval = setInterval(async() => {
      if(channelId && channelId.length > 5) {
        console.log(`Music System - Relevant Checker`.brightCyan + ` - Kiểm tra các tin nhắn không liên quan`);
        let guild = client.guilds.cache.get(queue.id);
        if(!guild) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Không tìm thấy Guild!`);
        let channel = guild.channels.cache.get(channelId);
        if (!channel) channel = await guild.channels.fetch(channelId).catch(() => {}) || false;
        if (!channel) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Không tìm thấy kênh!`);
        let messages = await channel.messages.fetch();
        if(messages.filter(m => m.id != messageId).size > 0) {
          channel.bulkDelete(messages.filter(m => m.id != messageId)).catch(() => {}).then(messages => console.log(`Music System - Relevant Checker`.brightCyan + ` - Đã xóa hàng loạt ${messages.size ? messages.size : "0"} tin nhắn`));
        } else {
          console.log(`Music System - Relevant Checker`.brightCyan + ` - Không có tin nhắn liên quan`)
        };
      };
    }, 60000);
    /**
     * Music System Edit Embeds
     */
    var musicsystemeditinterval = setInterval(async() => {
      if(channelId  && channelId.length > 5) {
        let guild = client.guilds.cache.get(queue.id);
        if (!guild) return console.log(`Music System Edit Embeds`.brightMagenta + ` - Music System - Không tìm thấy Guild!`)
        let channel = guild.channels.cache.get(channelId);
        if(!channel) channel = await guild.channels.fetch(channelId).catch(() => {}) || false;
        if(!channel) return console.log(`Music System Edit Embeds`.brightMagenta + ` - Music System - Không tìm thấy kênh!`)
        let message = channel.messages.cache.get(messageId);
        if(!message) message = await channel.messages.fetch(messageId).catch(() => {}) || false;
        if(!message) return console.log(`Music System Edit Embeds`.brightMagenta + ` - Music System - Không tìm thấy tin nhắn!`)
        if(!message.editedTimestamp) return console.log(`Music System Edit Embeds`.brightCyan + ` - Chưa từng chỉnh sửa trước đây!`)
        if(Date.now() - message.editedTimestamp > (7000) - 100) {
          message.edit(generateQueueEmbed(client, queue.id)).catch((e) => console.log(e)).then(() => {
            console.log("Music System Edit Embeds".brightMagenta + ` - Đã chỉnh sửa Nhúng hệ thống âm nhạc, vì không có chỉnh sửa nào khác trong ${Math.floor((7000) / 1000)} giây!`)
          });
        };
      };
    }, 7000);
    /**
     * AUTO-RESUME-DATABASING
     */
    var autoresumeinterval = setInterval(async() => {
      if(newQueue && newQueue.id && data.DefaultAutoresume) {
        await autoresume.set(newQueue.id, {
          guild: newQueue.id,
          voiceChannel: newQueue.voiceChannel ? newQueue.voiceChannel.id : null,
          textChannel: newQueue.textChannel ? newQueue.textChannel.id : null,
          currentTime: newQueue.currentTime,
          repeatMode: newQueue.repeatMode,
          autoplay: newQueue.autoplay,
          playing: newQueue.playing,
          volume: newQueue.volume,
          filters: [...newQueue.filters.names].filter(Boolean),
          songs: newQueue.songs && newQueue.songs.length > 0 ? [...newQueue.songs].map((track) => {
            return {
              memberId: track.member.id, 
              source: track.source,
              duration: track.duration,
              formattedDuration: track.formattedDuration,
              id: track.id,
              isLive: track.isLive,
              name: track.name,
              thumbnail: track.thumbnail,
              type: "video",
              uploader: track.uploader,
              url: track.url,
              views: track.views,
            };
          }) : null,
        });
      };
    }, 4000);
  
    playerintervals.set(`autoresumeinterval-${queue.id}`, autoresumeinterval);
    playerintervals.set(`checkrelevantinterval-${queue.id}`, checkrelevantinterval);
    playerintervals.set(`musicsystemeditinterval-${queue.id}`, musicsystemeditinterval);
  }).on("disconnect", (queue) => {
    return queue.textChannel?.send({ embeds: [new EmbedBuilder().setDescription(":x: | Đã ngắt kết nối khỏi kênh voice")]}).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  }).on("empty", (queue) => {
      return queue.textChannel?.send({ content: "Kênh voice chống. rời khỏi kênh :))" }).then(msg => {
          setTimeout(() => msg.delete(), 10000);
      });
  }).on('error', (channel, error) => {
    console.error(error);
    return channel.send({ embeds: [new EmbedBuilder()
        .setDescription(`Đã xảy ra lỗi: ${error?.slice(0, 1979)}`)
        .setColor("Random")
        .setTitle("có lỗi suất hiện")
    ]}).then((msg) => setTimeout(() => msg.delete(), 10000));
  }).on("noRelated", async(queue) => {
    return await queue.textChannel?.send({ content:"Không thể tìm thấy video, nhạc liên quan để phát." }).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  }).on("searchCancel", async(queue) => {
    return await queue.textChannel?.send({ content: "Tìm kiếm bài hát bị hủy" }).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  }).on("searchNoResult", (message) => {
    return message.channel.send({ content: "Không thể tìm kiếm bài hát" }).catch((e) => console.log(e));
  }).on("searchResult", (message, results) => {
    let i = 0
    return message.channel.send({ content: `**Chọn một tùy chọn từ bên dưới**\n${results.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Nhập bất kỳ thứ gì khác hoặc đợi 60 giây để hủy*` });
  });
  
  client.on("interactionCreate", async(interaction) => {
    if(!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    var { guild, message, channel, member, user, customId } = interaction;
    const defaultData = await database.get(interaction.guild.id);
    if(!defaultData) return;
    const data = defaultData.setDefaultMusicData;
    if(!guild) guild = client.guilds.cache.get(interaction.guildId);
    if(!guild) return;
    //nếu chưa setup, return
    if(!data.ChannelId || data.ChannelId.length < 5) return;
    if(!data.MessageId || data.MessageId.length < 5) return;
    // nếu kênh không tồn tại, hãy thử lấy và trả về nếu vẫn không tồn tại
    if(!channel) channel = guild.channels.cache.get(interaction.channelId);
    if(!channel) return;
    // nếu không đúng kênh quay lại
    if(data.ChannelId != channel.id) return;
    //nếu không đúng tin nhắn, return
    if(data.MessageId != message.id) return;
    if(!member) member = guild.members.cache.get(user.id);
    if(!member) member = await guild.members.fetch(user.id).catch(() => {});
    if(!member) return;
    // nếu thành viên không được kết nối với voice, return
    if(!member.voice.channel) return interaction.reply({
      content: `**Vui lòng kết nối với kênh voice trước!**`, ephemeral: true,
    });
    let newQueue = client.distube.getQueue(guild.id);
    if(interaction.isButton()) {
      if(!newQueue || !newQueue.songs || !newQueue.songs[0]) return interaction.reply({
        content: "Hiện tại không phát bài hát nào :))", ephemeral: true
      });
      if(customId === "Stop") {
        if(newQueue) {
          await newQueue.stop();
        };
        return interaction.reply({ content: "⏹ **Ngừng phát và rời khỏi Kênh**" });
      } else if(customId === "Skip") {
        try {
          if(newQueue.songs.length == 0) {
            await newQueue.stop()
            return interaction.reply({ content: "Ngừng phát và rời khỏi Kênh" });
          };
          await newQueue.skip();
          return interaction.reply({ content: "⏭ **Đã chuyển sang Bài hát tiếp theo!**" });
        } catch(e) {
          return interaction.reply({ content: "Bạn chỉ có 1 bài hát trong danh sách phát" });
        };
      } else if(customId === "Pause") {
        if(newQueue.paused) {
          newQueue.resume();
          return interaction.reply({ content: "Tiếp tục phát nhạc" });
        } else {
          await newQueue.pause();
          return interaction.reply({ content: "Tạm dừng phát nhạc" });
        };
      } else if(customId === "Autoplay") {
        newQueue.toggleAutoplay();
        return interaction.reply({ content: `Tự động phát đã được ${newQueue.autoplay ? "bật" : "tắt"}` });
      } else if(customId === "Shuffle") {
        maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
        await newQueue.shuffle();
        return interaction.reply({ content: `Đã xáo trộn ${newQueue.songs.length} bài hát` });
      } else if(customId === "Song") {
        if(newQueue.repeatMode == 1) {
          await newQueue.setRepeatMode(0);
        } else {
          await newQueue.setRepeatMode(1);
        };
        return interaction.reply({ content: `${newQueue.repeatMode == 1 ? "Đã bật vòng lặp bài hát" : "Đã tắt vòng lặp bài hát"}` });
      } else if(customId === "Queue") {
        if(newQueue.repeatMode == 2) {
          await newQueue.setRepeatMode(0);
        } else {
          await newQueue.setRepeatMode(2);
        };
        return interaction.reply({ content: `${newQueue.repeatMode == 2 ? "Đã bật vòng lặp hàng đợi" : "Đã tắt vòng lặp bài hát"}` });
      } else if(customId === "Forward") {
        let seektime = newQueue.currentTime + 10;
				if(seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
        await newQueue.seek(seektime);
        return interaction.reply({ content: "Đã tua bài hát về trước 10 giây" });
      } else if(customId === "VolumeUp") {
        try {
          const volumeUp = Number(newQueue.volume) + 10;
          if(volumeUp < 0 || volumeUp > 100) return interaction.reply({
            embeds: [new EmbedBuilder().setColor("Random").setDescription("Bạn chỉ có thể đặt âm lượng từ 0 đến 100.").setTimestamp()], ephemeral: true 
          });
			    await newQueue.setVolume(volumeUp);
			    await interaction.reply({ content: `:white_check_mark: | Âm lượng tăng lên ${volumeUp}%` });
        } catch (error) {
          console.log(error);
        };
      } else if(customId === "VolumeDown") {
        try {
          const volumeDown = Number(newQueue.volume) - 10;
          const invalidVolume = new EmbedBuilder().setColor("Random").setDescription(":x: | Không thể giảm âm lượng của bạn nữa nếu tiếp tục giảm bạn sẽ không nghe thấy gì").setTimestamp();
          if(volumeDown <= 0) return interaction.reply({ embeds: [invalidVolume] });
			    await newQueue.setVolume(volumeDown);
			    await interaction.reply({ content: `:white_check_mark: | Âm lượng giảm xuống ${volumeDown}%` });
        } catch (error) {
          console.log(error);
        };
      } else if(customId === "Rewind") {
        let seektime = newQueue.currentTime - 10;
				if(seektime < 0) seektime = 0;
				if(seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
        await newQueue.seek(seektime);
        return interaction.reply({ content: "Đã tua bài hát về sau 10 giây" });
      } else if(customId === "Lyrics") {
        await interaction.reply({ content: "Đang tìm kiếm lời bài hát", embeds: [], ephemeral: true });
        let thumbnail = newQueue.songs.map((song) => song.thumbnail).slice(0, 1).join("\n");
        let name = newQueue.songs.map((song) => song.name).slice(0, 1).join("\n");
        return interaction.editReply({ embeds: [new EmbedBuilder()
          .setAuthor({ name: name, iconURL: thumbnail, url: newQueue.songs.map((song) => song.url).slice(0, 1).join("\n") })
          .setColor("Random")
          .setThumbnail(thumbnail)
          .setDescription((await require("lyrics-finder")(newQueue.songs.map((song) => song.uploader.name).slice(0, 1).join("\n"), name)) || "Không tìm thấy lời bài hát!")
        ], ephemeral: true });
      };
      updateMusicSystem(newQueue);
    } else if(interaction.isStringSelectMenu()) {
      let link;
      if(interaction.values[0]) {
        //gaming
        if(interaction.values[0].toLowerCase().startsWith(`g`)) link = `https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6`;
        //ncs | no copyrighted music
        if(interaction.values[0].toLowerCase().startsWith(`n`)) link = `https://open.spotify.com/playlist/7sZbq8QGyMnhKPcLJvCUFD`;
      };
      await interaction.reply({	content: `Đang tải **${interaction.values[0]}**`, ephemeral: true });
			try {
				await client.distube.play(member.voice.channel, link, { member: member });
				return interaction.editReply({	content: `${newQueue?.songs?.length > 0 ? "👍 Thêm vào" : "🎶 Đang phát"}: **'${interaction.values[0]}'**`, ephemeral: true });
			} catch(e) {
				console.log(e);
			};
    };
  });
};