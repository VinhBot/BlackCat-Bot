const { EmbedBuilder } = require("discord.js");
const { Music: database } = require(`${process.cwd()}/Assets/Schemas/database`);
const config = require(`${process.cwd()}/config.json`);

module.exports = {
	eventName: "interactionCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, interaction) => {
    if(!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    var { guild, message, channel, member, user, customId } = interaction;
    const data = await database.findOne({ GuildId: interaction.guild.id });
    if(!data) return; // trả về nếu không tìm thấy data
    if(!guild) guild = client.guilds.cache.get(interaction.guildId);
    if(!guild) return; // trả về nếu không tìm thấy guilds
    // nếu chưa setup, return
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
      content: `**Vui lòng kết nối với kênh voice trước!**`
    });
    let newQueue = client.distube.getQueue(guild.id);
    if(interaction.isButton()) {
      if(!newQueue || !newQueue.songs || !newQueue.songs[0]) return interaction.reply({
        content: "Hiện tại không phát bài hát nào :))"
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
        client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
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
      client.updateMusicSystem(newQueue);
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
  },
};