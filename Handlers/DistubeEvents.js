const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType, ButtonStyle } = require("discord.js");
const { Music: database } = require(`${process.cwd()}/Assets/Schemas/database`);
const { MusicRole, customEvents } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
const playerintervals = new Map();
const PlayerMap = new Map();
let songEditInterval = null;
let lastEdited = false;

// export module :))) 
module.exports = (client) => {
  const { EmbedBuilders } = customEvents();
  /*========================================================
  # Functions 
  ========================================================*/
  const disspace = (newQueue, newTrack, queue) => {
    if(!newQueue) return new EmbedBuilders({ color: "Random", title: { name: "Không thể tìm kiếm bài hát" } });
    if(!newTrack) return new EmbedBuilders({ color: "Random", title: { name: "Không thể tìm kiếm bài hát" } });
    let skip = new ButtonBuilder({ style: ButtonStyle.Primary, customId: "skip", emoji: "⏭", label: "Bỏ qua", disabled: false });
    let stop = new ButtonBuilder({ style: ButtonStyle.Danger, customId: "stop", emoji: "🛑", label: "Dừng phát", disabled: false });
    let pause = new ButtonBuilder({ style: ButtonStyle.Success, customId: "pause", emoij: "⏸", label: "Tạm dừng", disabled: false });
    let autoplay = new ButtonBuilder({ style: ButtonStyle.Success, customId: "autoplay", emoji: "🧭", label: "Tự động phát", disabled: false });
    let shuffle = new ButtonBuilder({ style: ButtonStyle.Primary, customId: "shuffle", emoji: "🔀", label: "Xáo trộn", disabled: false });
    let songloop = new ButtonBuilder({ style: ButtonStyle.Success, customId: "song", emoji: "🔁", label: "Bài hát", disabled: false });
    let queueloop = new ButtonBuilder({ style: ButtonStyle.Success, customId: "queue", emoji: "🔂", label: "Hàng chờ", disabled: false });
    let forward = new ButtonBuilder({ style: ButtonStyle.Primary, customId: "seek", emoji: "⏩", label: "+10 Giây", disabled: false });
    let rewind = new ButtonBuilder({ style: ButtonStyle.Primary, customId: "seek2", emoji: "⏪", label: "-10 Giây", disabled: false });
    let lyrics = new ButtonBuilder({ style: ButtonStyle.Primary, customId: "lyrics", emoji: "📝", label: "Lời nhạc", disabled: false });
    let volumeUp = new ButtonBuilder({ style: ButtonStyle.Primary, customId: "volumeUp", emoji: "🔊", label: "+10", disabled: false });
    let volumeDown = new ButtonBuilder({ style: ButtonStyle.Primary, customId: "volumeDown", emoji: "🔉", label: "-10", disabled: false });
    if(!newQueue.playing) {
      pause = pause.setStyle('Success').setEmoji('▶️').setLabel(`Tiếp tục`);
    } else if(newQueue.autoplay) {
      autoplay = autoplay.setStyle('Secondary');
    } else if(newQueue.repeatMode === 0) {
      songloop = songloop.setStyle('Success');
      queueloop = queueloop.setStyle('Success');
    } else if(newQueue.repeatMode === 1) {
      songloop = songloop.setStyle('Secondary');
      queueloop = queueloop.setStyle('Success');
    } else if(newQueue.repeatMode === 2) {
      songloop = songloop.setStyle('Success');
      queueloop = queueloop.setStyle('Secondary');
    };
    if(Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled(true);
    } else {
      rewind = rewind.setDisabled(false);
    };
    if(Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
      forward = forward.setDisabled(true);
    } else {
      forward = forward.setDisabled(false);
    };
    // lấy dữ liệu request roles
    const dataMusic = database.findOne({ GuildId: newQueue.id });
    var djs = dataMusic.Djroles;
    if(!djs || !Array.isArray(djs)) {
      djs = [];
    } else djs = djs.map(r => `<@&${r}>`);
    if(djs.length == 0 ) {
      djs = `\`Không thiết lập\``;
    } else djs.slice(0, 15).join(`, `);
    // tạo embeds hiển thị
    const embeds = new EmbedBuilders({
      author: { name: `${newTrack.name}`, iconURL: "https://i.pinimg.com/originals/ab/4d/e0/ab4de08ece783245be1fb1f7fde94c6f.gif", url: newTrack.url },
      images: `https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`,
      timestamp: true,
      color: "Random",
      fields: [
        { name: `Thời lượng:`, value: `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\`` },
        { name: `Hàng chờ:`, value: `>>> \`${newQueue.songs.length} bài hát\`\n\`${newQueue.formattedDuration}\`` },
        { name: `Âm lượng:`, value: `>>> \`${newQueue.volume} %\`` },
        { name: `vòng lặp:`, value: `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `✔️ hàng chờ` : `✔️ Bài hát` : `❌`}` },
        { name: `Tự động phát:`, value: `>>> ${newQueue.autoplay ? `✔️` : `❌`}` },
        { name: `Filters:`, value: `\`${newQueue.filters.names.join(", ") || "Tắt"}\`` },
        { name: `MusicRole:`, value: `${djs}` },
        { name: `Tải nhạc về:`, value: `>>> [Click vào đây](${newTrack.streamURL})` },
        { name: `Lượt xem:`, value: `${Intl.NumberFormat().format(newQueue.songs[0].views)}` },
        { name: `Likes`, value: `👍 ${Intl.NumberFormat().format(newQueue.songs[0].likes)}` },
        { name: `Dislikes`, value: `👎 ${Intl.NumberFormat().format(newQueue.songs[0].dislikes)}` },
      ]
    });
    // khởi tạo các nút phản ứng
    const row1 = new ActionRowBuilder({ components: [skip, lyrics, pause, autoplay, shuffle] });
    const row2 = new ActionRowBuilder({ components: [songloop, queueloop, rewind, forward, volumeDown] });
    const row3 = new ActionRowBuilder({ components: [volumeUp, stop] });
    return { embeds: [embeds], components: [row1, row2, row3] };
  };
  // tạo hàng đợi embed
  const generateQueueEmbed = (queue, guildId, leave) => {
    // mốc tính thời gian 
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
    // gif chờ chạy nhạc
    const genshinGif = [
      "https://upload-os-bbs.hoyolab.com/upload/2021/08/12/64359086/ad5f51c6a4f16adb0137cbe1e86e165d_8637324071058858884.gif?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,gif",
      "https://upload-os-bbs.hoyolab.com/upload/2021/08/12/64359086/2fc26b1deefa6d2ff633dda1718d6e5b_6343886487912626448.gif?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,gif",
    ];
    const randomGenshin = genshinGif[Math.floor(Math.random() * genshinGif.length)];
    // tìm kiếm guilds
    let guild = client.guilds.cache.get(guildId);
    if(!guild) return; // nếu không thấy guilds, return 
    let newQueue = client.distube.getQueue(guild.id); // tìm kiếm hàng đợi 
    // khởi tạo embeds 
    var embeds = [
      new EmbedBuilders({
        description: "**Hiện tại có 0 Bài hát trong Hàng đợi**",
        title: { name: `📃 hàng đợi của __${guild.name}__` },
        thumbnail: guild.iconURL({ dynamic: true }),
        colors: "Random",
        fields: [
          { name: "Bắt đầu nghe nhạc, bằng cách kết nối với Kênh voice và gửi __liên kết bài hát__ hoặc __tên bài hát__ trong Kênh này!", value: "\u200B" },
          { name: "Tôi hỗ trợ __youtube-url__, __Spotify__, __SoundCloud__ và các __mp3__ trực tiếp ...", value: "\u200B" },
        ]
      }),
      new EmbedBuilders({
        footer: { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) },
        images: randomGenshin,
        colors: "Random"
      })
    ];
    // hiển thị và khởi chạy bài hát đầu tiên
    if(!leave && newQueue && newQueue.songs[0]) {
      embeds[1] = new EmbedBuilders({
        images: `https://img.youtube.com/vi/${newQueue.songs[0].id}/mqdefault.jpg`,
        author: { name: `${newQueue.songs[0].name}`, iconURL: `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`, url: newQueue.songs[0].url },
        footer: { text: `${newQueue.songs[0].user?.tag}`, iconURL: newQueue.songs[0].user?.displayAvatarURL({ dynamic: true }) },
        colors: "Random",
        fields: [
          { name: `🔊 Âm lượng:`, value: `>>> \`${newQueue.volume} %\``, inline: true },
          { name: `${newQueue.playing ? `♾ Vòng lặp:` : `⏸️ Đã tạm dừng:`}`, value: newQueue.playing ? `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `✔️ Hàng đợi` : `✔️ \`Bài hát\`` : `❌`}` : `>>> ✔️`, inline: true },
          { name: `❔ Filters:`, value: `>>> ${newQueue.filters.names.join(", ") || "❌"}`, inline: true },
          { name: `⏱ Thời gian:`, value: `\`${newQueue.formattedCurrentTime}\` ${createBar(newQueue.songs[0].duration, newQueue.currentTime, 13)} \`${newQueue.songs[0].formattedDuration}\``, inline: true },
          { name: `🚨 Yêu cầu bởi:`, value: `>>> ${newQueue.songs[0].user}`, inline: true }
        ],
      });
      var maxTracks = 10; // bài hát / Trang hàng đợi 
      embeds[0] = new EmbedBuilders({
        title: { name: `📃 hàng đợi của __${guild.name}__ - [${newQueue.songs.length} bài hát]` },
        colors: "Random",
        description: `${String(newQueue.songs.slice(0, maxTracks).map((track, index) => `**\` ${++index}. \` ${track.url ? `[${track.name.substr(0, 60).replace(/\[/igu, `\\[`).replace(/\]/igu, `\\]`)}](${track.url})` : track.name}** - \`${track.isStream ? "Trực Tiếp" : track.formattedDuration}\`\n> *Được yêu cầu bởi: __${track.user?.tag}__*`).join(`\n`)).substr(0, 2048)}`,
      });
      // hiển thị số lượng bài hát đang chờ
      if(newQueue.songs.length > 10) {
        embeds[0].addFields({ name: `**\` =>. \` và *${newQueue.songs.length > maxTracks ? newQueue.songs.length - maxTracks : newQueue.songs.length}*** bài hát khác ...`, value: `\u200b` })
      }; 
      // hiển thị bài hát đang được phát
      embeds[0].addFields({ name: `**\` =>. \` __HIỆN TẠI ĐANG PHÁT__**`, value: `**${newQueue.songs[0].url ? `[${newQueue.songs[0].name.substr(0, 60).replace(/\[/igu, `\\[`).replace(/\]/igu, `\\]`)}](${newQueue.songs[0].url})` : newQueue.songs[0].name}** - \`${newQueue.songs[0].isStream ? "Trực Tiếp" : newQueue.formattedCurrentTime}\`\n> *Được yêu cầu bởi: __${newQueue.songs[0].user?.tag}__*` })
    };
    var stopbutton = new ButtonBuilder({ style: ButtonStyle.Danger, customId: "Stop", emoji: "🏠", label: "Dừng phát", disabled: true });
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
    // tạo thành phần phản ứng 
    var Emojis = [`0️⃣`, `1️⃣`];
    var playlistName = [`Gaming`, `NCS | No Copyright Music`];
    const selectMenu = new StringSelectMenuBuilder().setCustomId("StringSelectMenuBuilder").addOptions(playlistName.map((t, index) => {
      return {
        label: t.substr(0, 25), // trích xuất từ 0 đến 25 từ 
        value: t.substr(0, 25), // trích xuất từ 0 đến 25 từ
        description: `Tải Danh sách phát nhạc: '${t}'`.substr(0, 50),  // trích xuất từ 0 đến 50 từ
        emoji: Emojis[index] // thêm emoji cho từng cụm từ
      };
    }));
    const row0 = new ActionRowBuilder({ components: [selectMenu] });
    const row1 = new ActionRowBuilder({ components: [skipbutton, stopbutton, pausebutton, autoplaybutton, shufflebutton] });
    const row2 = new ActionRowBuilder({ components: [songbutton, queuebutton, forwardbutton, rewindbutton, lyricsbutton] });
    const row3 = new ActionRowBuilder({ components: [volumeupbutton, volumedownbutton] });
    //bây giờ chúng tôi thêm các thành phần!
    return { embeds, components: [row0, row1, row2, row3] };                                                                                                           
  };
  // cập nhật Hệ thống âm nhạc
  const updateMusicSystem = async(queue, leave = false) => {
    const data = await database.findOne({ GuildId: queue.id });
    if(!data) return; // nếu không thấy data, return;
    if(!queue) return; // nếu không thấy queue, return;
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
  const distube = client.distube;
  client.updateMusicSystem = updateMusicSystem;
  distube.on("playSong", async(queue, track) => {
    const defaultData = await database.findOne({ GuildId: queue.id });
    if(!defaultData) return;
    var newQueue = distube.getQueue(queue.id);
    updateMusicSystem(newQueue); 
    const nowplay = await queue.textChannel?.send(disspace(newQueue, track)).then((message) => {
      PlayerMap.set("currentmsg", message.id);
      return message;
    }).catch((e) => console.log(e));
    if(queue.textChannel?.id === defaultData.ChannelId) return;
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
                  return await i.reply({ embeds: [new EmbedBuilders({
                    colors: "Random",
                    title: { name: "⏹ **Dừng phát nhạc**" },
                    footer: { text: `Yêu cầu bởi: ${member.user.tag}`, iconURL: `${member.user.displayAvatarURL({ dynamic: true })}`},
                  })]
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
      const embed = new EmbedBuilders({
        author: { name: `${song.name}`, iconURL: "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png", url: song.url },
        footer: { text: `💯 ${song.user.tag}\n⛔️ Bài hát đã kết thúc!`, iconURL: song.user.displayAvatarURL({ dynamic: true }) },
        thumbnail: `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`,
        colors: "Random"
      });
      return msg.edit({ 
        embeds: [embed], 
        components: []
      }).catch((e) => console.log(e));
    }).catch((e) => console.log(e));
  }).on("finish", async(queue) => {
    return queue.textChannel?.send({ 
      embeds: [new EmbedBuilders({ color: "Random", description: "Đã phát hết nhạc trong hàng đợi,.. rời khỏi kênh voice" })]
    }).catch((e) => { });
  }).on("addList", async(queue, playlist) => {
    const embed = new EmbedBuilders({
      description: `👍 Danh sách: [\`${playlist.name}\`](${playlist.url ?playlist.url : ``})  -  \`${playlist.songs.length} Bài hát ${playlist.songs.length > 0 ? `` : ``}\``,
      thumbnail: `${playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`}`,
      footer: { text: `💯 ${playlist.user.tag}`, iconURL: `${playlist.user.displayAvatarURL({ dynamic: true })}` },
      title: { name: "Đã thêm vài hát vào hàng đợi" },
      timestamp: true,
      colors: "Random",
      fields: [
        { name: `**Thời gian dự tính**`, value: `\`${queue.songs.length - - playlist.songs.length} Bài hát\` - \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(`.`, `:`)}\``, inline: true },
        { name: `**Thời lượng hàng đợi**`, value: `\`${queue.formattedDuration}\``, inline: true },
      ]
    });
    return queue.textChannel?.send({ embeds: [embed] }).catch((e) => {});
  }).on("addSong", async(queue, song) => {
    const embed = new EmbedBuilders({
      author: { name: `Bài hát đã được thêm!`, iconURL: `${song.user.displayAvatarURL({ dynamic: true })}`, url: `${song.url}` },
      footer: { text: `💯 ${song.user.tag}`, iconURL: `${song.user.displayAvatarURL({ dynamic: true })}` },
      description: `👍 Bài hát: [${song.name}](${song.url})  -  ${song.formattedDuration}`,
      thumbnail: `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`,
      timestamp: true,
      colors: "Random",
      fields: [
        { name: `⌛ **Thời gian dự tính**`, value: `\`${queue.songs.length - 1} Bài hát\` - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(`.`, `:`)}\``, inline: true },
        { name: `🎥 Lượt xem`, value: `${(queue.songs[0].views).toLocaleString()}`, inline: true },
        { name: `👍 Likes`, value: `${(queue.songs[0].likes).toLocaleString()}`, inline: true },
        { name: `👎 Dislikes`, value: `${(queue.songs[0].dislikes).toLocaleString()}`, inline: true},
        { name: `🌀 **Thời lượng hàng đợi**`, value: `\`${queue.formattedDuration}\``, inline: true },
      ]
    });
    return queue.textChannel?.send({ embeds: [embed] }).catch((e) => {});
  }).on("deleteQueue", async(queue) => {
    var newQueue = client.distube.getQueue(queue.id);
    if(!PlayerMap.has(`deleted-${queue.id}`)) {
      PlayerMap.set(`deleted-${queue.id}`, true);
      if(client.maps.has(`beforeshuffle-${queue.id}`)){
        client.maps.delete(`beforeshuffle-${newQueue.id}`);
      };
      try {
        //Xóa khoảng thời gian để kiểm tra hệ thống thông báo liên quan
        clearInterval(playerintervals.get(`checkrelevantinterval-${queue.id}`))
        playerintervals.delete(`checkrelevantinterval-${queue.id}`);
        // Xóa khoảng thời gian cho Hệ thống Embed Chỉnh sửa Nhạc
        clearInterval(playerintervals.get(`musicsystemeditinterval-${queue.id}`))
        playerintervals.delete(`musicsystemeditinterval-${queue.id}`);
      } catch(e) {
        console.log(e);
      };
      updateMusicSystem(queue, true);
      return queue.textChannel?.send({ embeds: [new EmbedBuilder()
        .setColor("Random")
        .setTitle(`⛔️`)
        .setDescription(`:headphones: **Hàng đợi đã bị xóa**`)
        .setTimestamp()
      ]}).catch((ex) => {});
    };
  }).on("initQueue", async(queue) => {
    const data = await database.findOne({ GuildId: queue.id });
    var newQueue = client.distube.getQueue(queue.id);
    if(!data) return;
    let channelId = data.ChannelId;
    let messageId = data.MessageId;
    if(PlayerMap.has(`deleted-${queue.id}`)) {
      PlayerMap.delete(`deleted-${queue.id}`);
    };
    queue.autoplay = Boolean(data.DefaultAutoplay);
    queue.volume = Number(data.DefaultVolume);
    queue.filters.set(data.DefaultFilters);
    queue.voice.setSelfDeaf(true); 
    /** 
    * Kiểm tra các thông báo có liên quan bên trong Kênh yêu cầu hệ thống âm nhạc
    */
    playerintervals.set(`checkrelevantinterval-${queue.id}`, setInterval(async() => {
      if(channelId && channelId.length > 5) {
        console.log(`Music System - Relevant Checker`.brightCyan + ` - Kiểm tra các tin nhắn không liên quan`);
        let guild = client.guilds.cache.get(queue.id);
        if(!guild) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Không tìm thấy Guild!`);
        let channel = guild.channels.cache.get(channelId);
        if(!channel) channel = await guild.channels.fetch(channelId).catch(() => {}) || false;
        if(!channel) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Không tìm thấy kênh!`);
        let messages = await channel.messages.fetch();
        if(messages.filter(m => m.id != messageId).size > 0) {
          channel.bulkDelete(messages.filter(m => m.id != messageId)).catch(() => {}).then(messages => console.log(`Music System - Relevant Checker`.brightCyan + ` - Đã xóa hàng loạt ${messages.size ? messages.size : "0"} tin nhắn`));
        } else {
          console.log(`Music System - Relevant Checker`.brightCyan + ` - Không có tin nhắn liên quan`)
        };
      };
    }, 60000));
    /**
    * Music System Edit Embeds
    */
    playerintervals.set(`musicsystemeditinterval-${queue.id}`, setInterval(async() => {
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
    }, 7000));
  }).on("disconnect", (queue) => {
    return queue.textChannel?.send({ embeds: [new EmbedBuilder().setDescription(":x: | Đã ngắt kết nối khỏi kênh voice")] }).catch((e) => {});
  }).on("empty", (queue) => {
      return queue.textChannel?.send({ content: "Kênh voice chống. rời khỏi kênh :))" }).catch((e) => {});
  }).on('error', (channel, error) => {
    return channel.send({ embeds: [new EmbedBuilder()
        .setDescription(`Đã xảy ra lỗi: ${error?.slice(0, 1979)}`)
        .setColor("Random")
        .setTitle("có lỗi suất hiện")
    ]}).catch((e) => {});
  }).on("noRelated", async(queue) => {
    return await queue.textChannel?.send({ content:"Không thể tìm thấy video, nhạc liên quan để phát." }).catch((e) => {});
  }).on("searchCancel", async(queue) => {
    return await queue.textChannel?.send({ content: "Tìm kiếm bài hát bị hủy" }).catch((e) => {});
  }).on("searchNoResult", (message) => {
    return message.channel.send({ content: "Không thể tìm kiếm bài hát" }).catch((e) => console.log(e));
  }).on("searchResult", (message, results) => {
    let i = 0;
    return message.channel.send({ content: `**Chọn một tùy chọn từ bên dưới**\n${results.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Nhập bất kỳ thứ gì khác hoặc đợi 60 giây để hủy*` });
  });
};