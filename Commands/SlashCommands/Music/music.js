const { ApplicationCommandOptionType, EmbedBuilder, ChannelType, SelectMenuBuilder, ActionRowBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require('canvas');
module.exports = {
  name: "music", // Tên lệnh 
  description: "phát một bài hát", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  options: [
    {
      name: "lyrics",
      description: "tìm kiếm lời nhạc đang phát",
      type: ApplicationCommandOptionType.Subcommand,
    },{ 
      name: "play",
      description: "phát nhạc theo yêu cầu",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "name",
          description: "nhập tên bài hát hoặc url bài hát",
          type: ApplicationCommandOptionType.String,
          required: true,
      }],
    },{
      name: "playmix",
      description: "phát nhạc theo playlist có sẵn",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "playlist",
          description: "bạn muốn phát playlist nào",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
             { name: "phát nhạc: lofi chill", value: "lofii" },                   
             { name: "phát nhạc: Thất tình", value: "thattinh" },
             { name: "phát nhạc: Real love", value: "reallove" },
             { name: "phát nhạc: Gaming", value: "gaming" }, 
          ]
      }],
    },{
      name: "volume",
      description: "Tăng giảm âm lượng phát nhạc", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "số_âm_lượng",
          description: "Số âm lượng bạn muốn thêm", 
          type: ApplicationCommandOptionType.Number,
          required: true,
      }],
    },{
      name: "seek",
      description: "Tìm kiếm vị trí được chỉ định trong bài hát", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "số_giây",
          description: "Cung cấp một vị trí (tính bằng giây) để tìm kiếm.", 
          type: ApplicationCommandOptionType.Number,
          required: true,
      }],
    },{
      name: "settings",
      description: "Chọn một tùy chọn theo yêu cầu nghe nhạc của bạn", 
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "tùy_chọn",
        description: "Chọn một tùy chọn.", 
        type: ApplicationCommandOptionType.String, 
        required: true, 
        choices: [
          { name: "🔄 Chuyển đổi chế độ tự động phát", value: "autoPlay"},
          { name: "♨️ Tham gia kênh voice của bạn", value: "join"},
          { name: "🔢 Xem danh sách hàng đợi", value: "queue"},
          { name: "⏭ Bỏ qua bài hát", value: "skip"},
          { name: "⏸ Tạm dừng bài hát", value: "pause"},
          { name: "⏯ Tiếp tục bài hát", value: "resume"},
          { name: "⏹ Dừng nhạc", value: "stop"},
          { name: "🔀 Xáo trộn hàng đợi", value: "shuffle"},
          { name: "🔼 Thêm một bài hát liên quan", value: "relatedSong"},
          { name: "🔁 Chuyển đổi chế độ lặp lại", value: "repeatMode"},
          { name: "⏮ Phát bài hát trước", value: "previous"},
          { name: "⏳ Xem vài hát hiện tại đang phát", value: "nowplaying"},
        ],
      }],
    },{
      name: "filters",
      description: "áp dụng filters cho trình phát nhạc",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "set",
          description: "bạn muốn loại filters nào",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "❌ Tắt tất cả các bộ lọc", value: "false" },
            { name: "📣 Chuyển đổi bộ lọc: 8d", value: "8d" },
            { name: "📣 Chuyển đổi bộ lọc: bassboost", value: "bassboost" },
            { name: "📣 Chuyển đổi bộ lọc: echo", value: "echo" },
            { name: "📣 Chuyển đổi bộ lọc: nightcore", value: "nightcore" },
            { name: "📣 Chuyển đổi bộ lọc: surround", value: "surround" },
            { name: "📣 Chuyển đổi bộ lọc: karaoke", value: "karaoke" },
            { name: "📣 Chuyển đổi bộ lọc: vaporwave", value: "vaporwave" },
            { name: "📣 Chuyển đổi bộ lọc: flanger", value: "flanger" },
            { name: "📣 Chuyển đổi bộ lọc: gate", value: "gate" },
            { name: "📣 Chuyển đổi bộ lọc: haas", value: "haas" },
            { name: "📣 Chuyển đổi bộ lọc: reveser", value: "reverse" },
            { name: "📣 Chuyển đổi bộ lọc: mcompand", value: "mcompand" },
            { name: "📣 Chuyển đổi bộ lọc: phaser", value: "phaser" },
            { name: "📣 Chuyển đổi bộ lọc: tremolo", value: "tremolo" },
            { name: "📣 Chuyển đổi bộ lọc: earwax", value: "earwax" }
          ],
      }],
    }
  ],
  run: async(client, interaction) => {
    const { options, member, guild, channel, guildId } = interaction;
    const VoiceChannel = member.voice.channel;
    const test = guild.channels.cache.filter(chnl => (chnl.type == ChannelType.GuildVoice)).find(channel => (channel.members.has(client.user.id)));
    if(!VoiceChannel) return interaction.reply({
      content: "Bạn phải ở trong một kênh voice để có thể sử dụng các lệnh âm nhạc.", 
      ephemeral: true 
    });
    if(test && VoiceChannel.id !== test.id) return interaction.reply({ 
      embeds: [new EmbedBuilder().setDescription(`❌ Tôi đã chơi trong <#${test.id}>`)], ephemeral: true
    });
    if(options.getSubcommand() === "play") {
      const Text = options.getString("name");
      await interaction.reply({	content: `🔍 Đang tìm kiếm... \`\`\`${Text}\`\`\`` });
      await client.distube.play(VoiceChannel, Text, {
        textChannel: channel,
        member: member
      });
			interaction.editReply({ content: `${client.distube.getQueue(guildId)?.songs?.length > 0 ? "👍 Đã thêm" : "🎶 Đang Phát"}: \`\`\`css\n${Text}\n\`\`\`` });
    } else if(options.getSubcommand() === "playmix") {
      let args = [options.getString("playlist")];
      let link = "https://open.spotify.com/playlist/5ravtOAghdGsfYeKhFx0xU";
		  if(args[0]) {
			  if(args[0].toLowerCase().startsWith(`lofi`)) {
          link = `https://open.spotify.com/playlist/2kLGCKLDSXu7d2VvApmiWg`;
        } else if(args[0].toLowerCase().startsWith(`thattinh`)) {
          link = `https://open.spotify.com/playlist/4Aj61H8LI3OdtHLwEf5wo5`;
        } else if(args[0].toLowerCase().startsWith(`reallove`)) {
          link = `https://open.spotify.com/playlist/7yQiYrVwwV8TgGa1FwhCUl`;
        } else if(args[0].toLowerCase().startsWith(`gaming`)) {
          link = `https://open.spotify.com/playlist/5ravtOAghdGsfYeKhFx0xU`;
        };
			};
		  await interaction.reply({ content: `Đang tải **'${args[0] ? args[0] : "nhạc mặc định"}'**` });
      let queue = client.distube.getQueue(guildId);
      await client.distube.play(VoiceChannel, link, {
        textChannel: channel,
        member: member
      });
      interaction.editReply({ content: `${queue?.songs?.length > 0 ? "👍 đã thêm" : "🎶 Đang phát"}: **'${args[0] ? args[0] : "mặc định"}'**`, ephemeral: true });
    } else if(options.getSubcommand() === "volume") {
      const Volume = options.getNumber("số_âm_lượng");
      if(Volume > 100 || Volume < 1) return interaction.reply({ content: "Bạn phải chỉ định một số từ 1 đến 100." });
      client.distube.setVolume(VoiceChannel, Volume);
      return interaction.reply({content: `📶 Âm lượng đã được đặt thành \`${Volume}%\``, ephemeral: true});
    } else if(options.getSubcommand() === "seek") {
      const queue = await client.distube.getQueue(VoiceChannel);
      const Time = options.getNumber("số_giây");
      if(!queue) return interaction.reply({ content: "⛔ Không có hàng đợi", ephemeral: true });
      await queue.seek(Time);
      return interaction.reply({ content: `⏩ **Tìm kiếm \`${Time}\`**`, ephemeral: true });
    } else if(options.getSubcommand() === "lyrics") {
      const lyricsfinder = require('lyrics-finder');
      try {
        const queue = await client.distube.getQueue(guildId);
        let name = queue.songs.map((song, id) => song.name).slice(0, 1).join("\n");
        let uploader = queue.songs.map((song, id) => song.uploader.name).slice(0, 1).join("\n");
        let thumbnail = queue.songs.map((song, id) => song.thumbnail).slice(0, 1).join("\n");
        let url = queue.songs.map((song, id) => song.url).slice(0, 1).join("\n");
        let lyrics = (await lyricsfinder(uploader, name)) || "Không tìm thấy lời bài hát!";
        interaction.reply({ embeds: [new EmbedBuilder()
          .setAuthor({ name: name, iconURL: thumbnail, url: url })
          .setColor("Random")
          .setThumbnail(thumbnail)
          .setDescription(lyrics),
        ]});
      } catch(e) {
        return interaction.reply({ content: "Bạn cần phải phát một bài nhạc nào đó.", ephemeral: true });
      };
    } else if(options.getSubcommand() === "settings") {
      const option = options.getString("tùy_chọn");
      if(option === "join") {
        client.distube.voices.join(VoiceChannel);
        return interaction.reply({ content: "Đã tham gia kênh voice của bạn" });                        
      };
      const queue = await client.distube.getQueue(VoiceChannel);
      if(!queue) return interaction.reply({content: "⛔ Không có hàng đợi.", ephemeral: true});
      if(option === "skip") {
        await queue.skip(VoiceChannel);
        return interaction.reply({ content: "⏭ Bỏ qua bài hát.", ephemeral: true});
      } else if(option === "stop") {
        await queue.stop(VoiceChannel);
        return interaction.reply({ content: "⏹ Dừng phát nhạc", ephemeral: true});
      } else if(option === "pause") {
        await queue.pause(VoiceChannel);
        return interaction.reply({ content: "⏸ Bài hát đã được tạm dừng.", ephemeral: true});                      
      } else if(option === "resume") {
        await queue.resume(VoiceChannel);
        return interaction.reply({ content: "⏯ Bài hát đã được tiếp tục.", ephemeral: true})                            
      } else if(option === "shuffle") {
        await queue.shuffle(VoiceChannel);
        return interaction.reply({ content: "🔀 Hàng đợi đã bị xáo trộn.", ephemeral: true})                                              
      } else if(option === "autoplay") {
        return interaction.reply({ content: `🔄 Chế độ tự động phát được đặt thành: ${await queue.toggleAutoplay(VoiceChannel) ? "Bật" : "Tắt"}`, ephemeral: true});                  
      } else if(option === "relatedSong") {
        await queue.addRelatedSong(VoiceChannel);
        return interaction.reply({ content: "🔼 Một bài hát liên quan đã được thêm vào hàng đợi.", ephemeral: true});                                      
      } else if(option === "repeatMode") {
        let Mode2 = await client.distube.setRepeatMode(queue);
        return interaction.reply({ content: `🔁 Chế độ Lặp lại được đặt thành: ${Mode2 = Mode2 ? Mode2 == 2 ? "Queue" : "Song" : "Off"}`, ephemeral: true});                                           
      } else if(option === "previous") {
        await queue.previous(VoiceChannel);
        return interaction.reply({ content: "⏮ Phát bản nhạc trước.", ephemeral: true});                                           
      } else if(option === "queue") {
        return interaction.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${queue.songs.map((song, id) => `\n**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``)}`)], ephemeral: true});                   
      } else if(option === "nowplaying") {
        let newQueue = client.distube.getQueue(guildId);
        if(!newQueue || !newQueue.songs || newQueue.songs.length == 0) return interaction.reply({
		    	embeds: [new EmbedBuilder().setColor("Random").setTitle("Danh sách nhạc trống")],
	      });
        let queuesong = newQueue.formattedCurrentTime;
        let cursong = newQueue.songs[0];
        let cursongtimes = 0;
        let cursongtimem = 0;
        let cursongtimeh = 0;
        let queuetimes = 0;
        let queuetimem = 0;
        let queuetimeh = 0;
        if(cursong.formattedDuration.split(":").length === 3) {
          cursongtimes = cursong.formattedDuration.split(":")[2]
          cursongtimem = cursong.formattedDuration.split(":")[1]
          cursongtimeh = cursong.formattedDuration.split(":")[0]
        };
        if(queuesong.split(":").length === 3) {
          queuetimes = queuesong.split(":")[2]
          queuetimem = queuesong.split(":")[1]
          queuetimeh = queuesong.split(":")[0]
        };
        cursongtimes = cursong.formattedDuration.split(":")[1]
        cursongtimem = cursong.formattedDuration.split(":")[0]
        queuetimes = queuesong.split(":")[1]
        queuetimem = queuesong.split(":")[0]
        let maxduration = Number(cursongtimes) + Number(cursongtimem) * 60 + Number(cursongtimeh) * 60 * 60;
        let minduration = Number(queuetimes) + Number(queuetimem) * 60 + Number(queuetimeh) * 60 * 60;
        let percentduration = Math.floor((minduration / maxduration) * 100);
        let songtitle = cursong.name;
        let oftime = `${newQueue.formattedCurrentTime}/${cursong.formattedDuration}`
        const canvas = Canvas.createCanvas(800, 200);
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/1092880002695036950/1103677516016787517/bg.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        const url = `https://img.youtube.com/vi/${cursong.id}/mqdefault.jpg`
        const avatar = await Canvas.loadImage(url);
        ctx.drawImage(avatar, 10, 10, 192, 108);
        var textString = songtitle.substr(0, 35);
        ctx.font = 'bold 40px Genta';
        ctx.fillStyle = '#d625ed';
        ctx.fillText(textString, 10 + 192 + 10, 10 + 25);
        let textStringt
        if (songtitle.length > 40) textStringt = songtitle.substr(35, 32) + "...";
        else textStringt = "";
        ctx.font = 'bold 40px Genta';
        ctx.fillStyle = '#d625ed';
        ctx.fillText(textStringt, 10 + 192 + 10, 10 + 25 + 40);
        ctx.font = 'bold 30px Genta';
        ctx.fillStyle = '#d625ed';
        ctx.fillText(oftime, 10 + 192 + 10, 10 + 25 + 30 + 50);
        let percent = percentduration;
        let index = Math.floor(percent) || 10;
        let left = Number(".".repeat(index).length) * 7.9;
        if(left < 50) left = 50;
        let x = 14;
        let y = 200 - 65;
        let width = left;
        let height = 50;
        let radius = 25;
        if(width < 2 * radius) radius = width / 2;
        if(height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fillStyle = '#d625ed';
        ctx.fill();
        const attachment = new AttachmentBuilder(canvas.toBuffer(), {
          name: 'nowplaying.png' 
        });
        return await interaction.reply({ 
          files: [attachment]
        });
      };
    } else if(options.getSubcommand() === "filters") {
      const queue = await client.distube.getQueue(VoiceChannel);
      if(!queue) return interaction.reply({ content: "⛔ Không có hàng đợi", ephemeral: true });
      const toggle = options.getString("set");
      if(toggle === "false") {
        await queue.filters.add(false);
        return interaction.reply({ content: `❎ Đã tắt tất cả bộ lọc.`, ephemeral: true });        
      } else if(toggle === "8d") {
        await queue.filters.add(`3d`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc 8D.`, ephemeral: true});                        
      } else if(toggle === "karaoke") {
        await queue.filters.add(`karaoke`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc karaoke.`, ephemeral: true});                         
      } else if(toggle === "vaporwave") {
        await queue.filters.add(`vaporwave`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc vaporwave.`, ephemeral: true});   
      } else if(toggle === "flanger") {
        await queue.filters.add(`flanger`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc flanger.`, ephemeral: true});                      
      } else if(toggle === "gate") {
        await queue.filters.add(`gate`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc gate.`, ephemeral: true});                        
      } else if(toggle === "haas") {
        await queue.filters.add(`haas`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc haas.`, ephemeral: true});                        
      } else if(toggle === "reverse") {
        await queue.filters.add(`reverse`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc reverse.`, ephemeral: true});   
      } else if(toggle === "mcompand") {
        await queue.filters.add(`mcompand`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc mcompand.`, ephemeral: true });                        
      } else if(toggle === "phaser") {
        await queue.filters.add(`phaser`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc phaser.`, ephemeral: true});                        
      } else if(toggle === "tremolo") {
        await queue.filters.add(`tremolo`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc tremolo.`, ephemeral: true});                      
      } else if(toggle === "earwax") {
        await queue.filters.add(`earwax`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc earwax.`, ephemeral: true});        
      } else if(toggle === "bassboost") {
        await queue.filters.add(`bassboost`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc bassboost.`, ephemeral: true});
      } else if(toggle === "echo") {
        await queue.filters.add(`echo`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc echo.`, ephemeral: true});                  
      } else if(toggle === "nightcore") {
        await queue.filters.add(`nightcore`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc nightcore.`, ephemeral: true});                      
      } else if(toggle === "surround") {
        await queue.filters.add(`surround`);
        return interaction.reply({content: `✅ Đã chuyển đổi bộ lọc surround.`, ephemeral: true});   
      };
    };
  },
};