module.exports = (client) => {
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, ButtonStyle } = require("discord.js");
  const { SoundCloudPlugin } = require("@distube/soundcloud");
  const { SpotifyPlugin } = require("@distube/spotify");
  const { YtDlpPlugin } = require("@distube/yt-dlp");
  const { DisTube } = require("distube");
  const database = require(`${process.cwd()}/Events/Json/database.json`);
  const config = require(`${process.cwd()}/config.json`);
  const moibot = {
    discord: "https://discord.com/api/oauth2/authorize?client_id=881709146695667773&permissions=8&scope=bot%20applications.commands",
    musicbot: "https://discord.gg/tSTY36dPWa"
  };
  const PlayerMap = new Map();
  const maps = new Map();
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
  client.distube = distube;
  const disspace = function(newQueue, newTrack, queue) {
    let skip = new ButtonBuilder().setStyle('Primary').setCustomId('skip').setEmoji(`⏭`).setLabel(`Bỏ qua`);
    let stop = new ButtonBuilder().setStyle('Danger').setCustomId('stop').setEmoji(`😢`).setLabel(`Dừng phát`);
    let pause = new ButtonBuilder().setStyle('Success').setCustomId('pause').setEmoji('⏸').setLabel(`Tạm dừng`);
    let autoplay = new ButtonBuilder().setStyle('Success').setCustomId('autoplay').setEmoji('🧭').setLabel(`Tự động phát`);
    let shuffle = new ButtonBuilder().setStyle('Primary').setCustomId('shuffle').setEmoji('🔀').setLabel(`Xáo trộn`);
    let songloop = new ButtonBuilder().setStyle('Success').setCustomId('song').setEmoji(`🔁`).setLabel(`Bài hát`);
    let queueloop = new ButtonBuilder().setStyle('Success').setCustomId('queue').setEmoji(`🔂`).setLabel(`Hàng chờ`);
    let forward = new ButtonBuilder().setStyle('Primary').setCustomId('seek').setEmoji('⏩').setLabel(`+10 Giây`);
    let rewind = new ButtonBuilder().setStyle('Primary').setCustomId('seek2').setEmoji('⏪').setLabel(`-10 Giây`);
    let lyrics = new ButtonBuilder().setStyle('Primary').setCustomId('lyrics').setEmoji('📝').setLabel(`Lời nhạc`);
    let volumeUp = new ButtonBuilder().setStyle('Primary').setCustomId('volumeUp').setEmoji('🔊').setLabel(`+10`);
    let volumeDown = new ButtonBuilder().setStyle('Primary').setCustomId('volumeDown').setEmoji('🔉').setLabel(`-10`);
    let discord = new ButtonBuilder().setStyle("Link").setEmoji('🏤').setLabel(`Vào discord`).setURL(`${moibot.discord}`);
    let invitebot = new ButtonBuilder().setStyle("Link").setEmoji('🗿').setLabel(`Mời Bot`).setURL(`${moibot.musicbot}`);
    if(!newQueue) return new EmbedBuilder().setColor(database.colors.vang).setTitle(`Không thể tìm kiếm bài hát`);
    if(!newTrack) return new EmbedBuilder().setColor(database.colors.vang).setTitle(`Không thể tìm kiếm bài hát`);
    if(!newQueue.playing) {
      pause = pause.setStyle('Success').setEmoji('▶️').setLabel(`Tiếp tục`)
    } else if(newQueue.autoplay) {
      autoplay = autoplay.setStyle('Secondary')
    } else if(newQueue.repeatMode === 0) {
      songloop = songloop.setStyle('Success')
      queueloop = queueloop.setStyle('Success')
    } else if(newQueue.repeatMode === 1) {
      songloop = songloop.setStyle('Secondary')
      queueloop = queueloop.setStyle('Success')
    } else if(newQueue.repeatMode === 2) {
      songloop = songloop.setStyle('Success')
      queueloop = queueloop.setStyle('Secondary')
    };
    if(Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled()
    } else {
      rewind = rewind.setDisabled(false)
    };
    if(Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
      forward = forward.setDisabled()
    } else {
      forward = forward.setDisabled(false)
    };
    return { 
      embeds: [new EmbedBuilder()
        .setAuthor({ name: `${newTrack.name}`, iconURL: "https://i.pinimg.com/originals/ab/4d/e0/ab4de08ece783245be1fb1f7fde94c6f.gif", url: newTrack.url })
        .setImage(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`).setColor(database.colors.vang)
        .addFields([
          { name: `Thời lượng:`, value: `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\`` },
          { name: `Hàng chờ:`, value: `>>> \`${newQueue.songs.length} bài hát\`\n\`${newQueue.formattedDuration}\`` },
          { name: `Âm lượng:`, value: `>>> \`${newQueue.volume} %\`` },
          { name: `vòng lặp:`, value: `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `✔️ hàng chờ` : `✔️ Bài hát` : `❌`}` },
          { name: `Tự động phát:`, value: `>>> ${newQueue.autoplay ? `✔️` : `❌`}` },
          { name: `Filters:`, value: `\`${newQueue.filters.names.join(", ") || "Tắt"}\`` },
          { name: `Tải nhạc về:`, value: `>>> [Click vào đây](${newTrack.streamURL})` },
          { name: `Lượt xem:`, value: `${Intl.NumberFormat().format(newQueue.songs[0].views)}` },
          { name: `Likes`, value: `>>>👍 ${Intl.NumberFormat().format(newQueue.songs[0].likes)}` },
          { name: `Dislikes`, value: `>>>👎 ${Intl.NumberFormat().format(newQueue.songs[0].dislikes)}` },
        ])
      ], 
      components: [
        new ActionRowBuilder().addComponents([ skip, lyrics, pause, autoplay, shuffle ]),
        new ActionRowBuilder().addComponents([ songloop, queueloop, rewind, forward, volumeDown ]),
        new ActionRowBuilder().addComponents([ volumeUp, stop, discord, invitebot ]),
      ] 
    };
  };
  
  try {
    distube.on("playSong", async(queue, track) => {
        var newQueue = distube.getQueue(queue.id);
        const nowplay = await queue.textChannel.send(disspace(newQueue, track)).then((msg) => {
          PlayerMap.set(`currentmsg`, msg.id);
          return msg;
        });
        var collector = nowplay.createMessageComponentCollector({
          filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
          time: track.duration > 0 ? track.duration * 1000 : 600000
        });
        //array tất cả các lần embed, ở đây chỉ đơn giản hóa 10 lần embed với các số từ 0 - 9
        let lastEdited = false;
        try {
          clearInterval(songEditInterval)
        } catch(e) {};
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
        collector.on('collect', async(i) => {
            lastEdited = true;
            setTimeout(() => lastEdited = false, 7000);
            let { member, guild } = i;
            if(!member.voice.channel) return i.reply({ content: `${emoji.x} **Bạn phải tham gia kênh voice mới có thể sử dụng lệnh**` });
            const test = guild.channels.cache.filter(chnl => (chnl.type == ChannelType.GuildVoice)).find(channel => (channel.members.has(client.user.id)));
            if(test && member.voice.channel.id !== test.id) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`❌ Tôi đã chơi trong <#${test.id}>`)], ephemeral: true });
            // bỏ qua bài hát
            if(i.customId == `skip`) {
              if (!member.voice.channel) return i.reply({ content: `**Bạn phải tham gia kednh voice mới có thể sử dụng lệnh**` });
              const queue = distube.getQueue(i.guild.id);
              if (!queue || !newQueue.songs || newQueue.songs.length == 0) {
                  await i.reply({ content: "Danh sách nhạc trống" });
                  setTimeout(() => i.deleteReply(), 3000);
              };
              if (member.voice.channel.id !== newQueue.voiceChannel.id) return i.reply({ content: `**Tham gia kênh voice của tôi**` });
              if (newQueue.songs.length == 0) {
                  await i.reply({ embeds: [new EmbedBuilder()
                    .setColor(database.colors.vang).setTimestamp()
                    .setTitle(`⏹ **Dừng phát nhạc**`)
                    .setFooter({ text: `Yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({ dynamic: true })}`})]
                  });
                  setTimeout(() => i.deleteReply(), 3000);
                  await distube.stop(i.guild.id);
                  return;
              };             
              try {
                  await distube.skip(i.guild.id) 
                  await i.reply({ embeds: [new EmbedBuilder()
                     .setColor(database.colors.vang).setTimestamp()
                     .setTitle(`⏭ **Bỏ qua bài hát!**`)
                     .setFooter({ text: `Yesu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}` })
                  ]});
                  nowplay.edit({ components: [] });
                  setTimeout(() => i.deleteReply(), 3000);
              } catch (error) {
                i.reply({ content: "Hiện tại chỉ có một bài hát trong playlist, bạn cần thêm tối thiểu ít nhất một bài hát nữa ..." });
              };
            } else if (i.customId == "stop") {
                nowplay.edit({ components: [] });
                await i.reply({ content: "👌 Đã dừng phát nhạc và rời khỏi kênh voice channel theo yêu cầu" });
                setTimeout(() => i.deleteReply(), 3000);
                await distube.voices.leave(i.guild.id);
            } else if (i.customId == "pause") {
              if (newQueue.playing) {
                await distube.pause(i.guild.id);
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
                await i.reply({ embeds: [new EmbedBuilder()
                    .setColor(database.colors.vang).setTimestamp()
                    .setTitle(`⏸ **Tạm dừng**`)
                    .setFooter({ text: `yêu cầu bởi ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
                });
                setTimeout(() => i.deleteReply(), 3000);
              } else {
                await distube.resume(i.guild.id);
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
                await i.reply({ embeds: [new EmbedBuilder()
                    .setColor(database.colors.vang).setTimestamp()
                    .setTitle(`▶️ **tiếp tục**`)
                    .setFooter({ text: `Yêu cầu bởi ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
                });
                setTimeout(() => i.deleteReply(), 3000);
              };
            } else if (i.customId == "autoplay") {
              await newQueue.toggleAutoplay()
              if (newQueue.autoplay) {
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {});
              } else {
                nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {});
              };
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor(database.colors.vang).setTimestamp()
                  .setTitle(`${newQueue.autoplay ? `✔️ **Đã bật chế độ tự động phát**`: `❌ **Đã tắt chế độ tự động phát**`}`)
                  .setFooter({ text: `yêu cầu bởi ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
               });
               setTimeout(() => i.deleteReply(), 3000);
            } else if(i.customId == "shuffle") {
              maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
              await newQueue.shuffle()
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor(database.colors.vang).setTimestamp()
                  .setTitle(`🔀 **Xáo trộn ${newQueue.songs.length} bài hát!**`)
                  .setFooter({ text: `YC bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              });
              setTimeout(() => i.deleteReply(), 3000);
            } else if(i.customId == "song") {
              if(newQueue.repeatMode == 1){
                await newQueue.setRepeatMode(0);
              } else {
                await newQueue.setRepeatMode(1);
              };
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor(database.colors.vang).setTimestamp()
                  .setTitle(`${newQueue.repeatMode == 1 ? `${v} **Lặp bài hát đã bật**`: `${x} **Lặp bài hát đã tắt**`}`)
                  .setFooter({ text: `Yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              });
              setTimeout(() => i.deleteReply(), 3000);
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
            } else if(i.customId == "queue"){
              if(newQueue.repeatMode == 2) {
                await newQueue.setRepeatMode(0)
              } else {
                await newQueue.setRepeatMode(2)
              };
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor(database.colors.vang).setTimestamp()
                  .setTitle(`${newQueue.repeatMode == 2 ? `${v} **Lặp hàng đợi đã bật**`: `${x} **Lặp hàng đợi đã tắt**`}`)
                  .setFooter({ text: `Yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
                });
              setTimeout(() => i.deleteReply(), 3000);
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
            } else if(i.customId == "seek"){
              let seektime = newQueue.currentTime + 10;
              if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000 })
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor(database.colors.vang).setTimestamp()
                  .setTitle(`⏩ **+10 Giây!**`)
                  .setFooter({ text: `yedu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              });
              setTimeout(() => i.deleteReply(), 3000);
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
            } else if(i.customId == "seek2"){
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              await i.reply({ embeds: [new EmbedBuilder()
                  .setColor(database.colors.vang).setTimestamp()
                  .setTitle(`⏪ **-10 Giây!**`)
                  .setFooter({ text: `yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({dynamic: true})}`})]
              });
              setTimeout(() => i.deleteReply(), 3000);
              nowplay.edit(disspace(distube.getQueue(newQueue.id), newQueue.songs[0])).catch((e) => {})
            } else if(i.customId == `lyrics`) {
              try {
                 let thumbnail = newQueue.songs.map((song) => song.thumbnail).slice(0, 1).join("\n");
                 let name = newQueue.songs.map((song) => song.name).slice(0, 1).join("\n");
                 i.reply({ embeds: [new EmbedBuilder()
                  .setAuthor({ name: name, iconURL: thumbnail, url: newQueue.songs.map((song) => song.url).slice(0, 1).join("\n") })
                  .setColor(database.colors.vang)
                  .setThumbnail(thumbnail)
                  .setDescription((await require("lyrics-finder")(newQueue.songs.map((song) => song.uploader.name).slice(0, 1).join("\n"), name)) || "Không tìm thấy lời bài hát!")
                 ], ephemeral: true });
              } catch(e) {
                  i.reply({ content: `Lỗi: ${e}`, ephemeral: true });
              };
            } else if(i.customId == "volumeUp") {
              try {
                const volumeUp = Number(newQueue.volume) + 10;
                if (volumeUp < 0 || volumeUp > 100) return i.reply({
                  embeds: [new EmbedBuilder().setColor(database.colors.vang).setDescription("Bạn chỉ có thể đặt âm lượng từ 0 đến 100.").setTimestamp()], ephemeral: true 
                });
			          await newQueue.setVolume(volumeUp);
			          await i.reply(`:white_check_mark: | Âm lượng tăng lên ${volumeUp}%`);
                setTimeout(() => i.deleteReply(), 3000);
              } catch (error) {
                console.log(error);
              };
            } else if(i.customId == "volumeDown") {
              try {
                const volumeDown = Number(newQueue.volume) - 10;
                const invalidVolume = new EmbedBuilder().setColor(database.colors.vang).setDescription(":x: | Không thể giảm âm lượng của bạn nữa nếu tiếp tục giảm bạn sẽ không nghe thấy gì").setTimestamp();
                if(volumeDown <= 0) return i.reply({ embeds: [invalidVolume], ephemeral: true });
			          await newQueue.setVolume(volumeDown);
			          await i.reply(`:white_check_mark: | Âm lượng giảm xuống ${volumeDown}%`)
                setTimeout(() => i.deleteReply(), 3000);
              } catch (error) {
                console.log(error);
              };
            };
        });
        collector.on('end', async(collected, reason) => {
          if(reason === "time") {
            nowplay.edit({ components: [] });
          };
        });
    }).on("finishSong", (queue, song) => {
        queue.textChannel.messages.fetch(PlayerMap.get(`currentmsg`)).then((msg) => {
          msg.edit({ embeds: [new EmbedBuilder()
            .setAuthor({ name: `${song.name}`, iconURL: "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png", url: song.url })
            .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
            .setFooter({ text: `💯 ${song.user.tag}\n⛔️ Bài hát đã kết thúc!`, iconURL: song.user.displayAvatarURL({ dynamic: true }) })
            .setColor("Random")
          ], components: []}).catch((e) => {});
        }).catch((e) => { });
    }).on("finish", async(queue) => {
      return await queue.textChannel.send({ embeds: [new EmbedBuilder()
        .setColor("Random")
        .setDescription("Đã phát hết nhạc trong hàng đợi,.. rời khỏi kênh voice")
      ]}).then((msg) => setTimeout(() => msg.delete(), 10000));
    }).on("addList", async(queue, playlist) => {
      return await queue.textChannel.send({ embeds: [new EmbedBuilder()
        .setTitle("Đã thêm vài hát vào hàng đợi")                                                
        .setColor(database.colors.vang)
        .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
        .setFooter({ text: `💯 ${playlist.user.tag}`, iconURL: `${playlist.user.displayAvatarURL({ dynamic: true })}`})
        .setDescription(`👍 Danh sách: [\`${playlist.name}\`](${playlist.url ? playlist.url : ``})  -  \`${playlist.songs.length} Bài hát ${playlist.songs.length > 0 ? `` : ``}\``)
        .addFields(
          { name: `**Thời gian dự tính**`, value: `\`${queue.songs.length - - playlist.songs.length} Bài hát${queue.songs.length > 0 ? `` : ``}\` - \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(`.`, `:`)}\``, inline: true },
          { name: `**Thời lượng hàng đợi**`, value: `\`${queue.formattedDuration}\``, inline: true },
        )
      ]}).then((msg) => setTimeout(() => msg.delete(), 11000));
    }).on("addSong", async(queue, song) => {
      return await queue.textChannel.send({ embeds: [new EmbedBuilder()
          .setColor(database.colors.vang)
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
    }).on("deleteQueue", (queue) => {
      if(!PlayerMap.has(`deleted-${queue.id}`)) {
        PlayerMap.set(`deleted-${queue.id}`, true);
        if(maps.has(`beforeshuffle-${queue.id}`)) {
          maps.delete(`beforeshuffle-${queue.id}`);
        };
      };
      return queue.textChannel.send({ embeds: [new EmbedBuilder()
        .setColor(database.colors.vang).setTimestamp()
        .setFooter({ text: `${database.name}`, iconURL: `${database.avatar}`})
        .setTitle("Đã phát hết nhạc")
        .setDescription(`🥲 **Đã phát hết nhạc trong hàng đợi**`)
      ]}).then(msg => setTimeout(() => msg.delete(), 10000));
    }).on("disconnect", (queue) => {
      return queue.textChannel.send({ embeds: [new EmbedBuilder().setDescription(":x: | Đã ngắt kết nối khỏi kênh voice")]}).then((msg) => {
        setTimeout(() => msg.delete(), 10000);
      });
    }).on("empty", () => {
      return queue.textChannel.send({ content: "Kênh voice chống. rời khỏi kênh :))" }).then(msg => {
          setTimeout(() => msg.delete(), 10000);
      });
    }).on('error', (channel, error) => {
      console.error(error);
      return channel.send({ embeds: [new EmbedBuilder()
             .setDescription(`Đã xảy ra lỗi: ${error.slice(0, 1979)}`)
             .setColor("Random")
             .setTitle("có lỗi suất hiện")
      ]}).then((msg) => setTimeout(() => msg.delete(), 10000));
    }).on("initQueue", (queue) => {
        try {
          queue.autoplay = Boolean(false); // tự bật chế độ autoplay hay không
          queue.volume = Number(50); // đặt âm lượng mặc định
          queue.filters.add(['bassboost', '3d']); // bộ lọc mặc định khi phát nhạc
          queue.voice.setSelfDeaf(true); // tự động đặt tắt âm thanh bên ngoài đối với bot
        } catch (error) {
          console.error(error)
        };
    }).on("noRelated", async(queue) => {
      return await queue.textChannel.send({ content:"Không thể tìm thấy video, nhạc liên quan để phát." }).then((msg) => {
        setTimeout(() => msg.delete(), 10000);
      });
    }).on("searchCancel", async(queue) => {
      return await queue.textChannel.send({ content: "Tìm kiếm bài hát bị hủy" }).then((msg) => {
        setTimeout(() => msg.delete(), 10000);
      });
    }).on("searchNoResult", (message) => {
      return message.channel.send({ content: "Không thể tìm kiếm bài hát" }).catch((e) => console.log(e));
    }).on("searchResult", (message, results) => {
      let i = 0
      return message.channel.send({ 
        content: `**Chọn một tùy chọn từ bên dưới**\n${results.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Nhập bất kỳ thứ gì khác hoặc đợi 60 giây để hủy*`
      });
    });
  } catch(e) {
    console.log(String(e.stack).bgRed);
  }; 
};