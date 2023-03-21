const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js')
function disableButtons(components) {
  for (let x = 0; x < components.length; x++) {
    for (let y = 0; y < components[x].components.length; y++) {
      components[x].components[y].disabled = true;
    }
  }
  return components;
};
const WIDTH = 7;
const HEIGHT = 6;

class Connect4Game {
    constructor(options = {}) {
      this.message = options.message;
      this.opponent = options.opponent;
      this.emojis = options.emojis;
      this.gameBoard = [];
      this.options = options;
      this.inGame = false;
      this.redTurn = true;
    }

    sendMessage(content) {
        if(this.options.slashCommand) {
          return this.message.editReply(content); 
        } else return this.message.channel.send(content)
    }
    
    getGameBoard() {
        let str = '';
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                str += '' + this.gameBoard[y * WIDTH + x];
            }
            str += '\n';
        }
        str += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣'
        return str;
    }
    async startGame() {
        if (this.options.slash_command) {
          if(!this.message.deferred) await this.message.deferReply({ ephemeral: false });
          this.message.author = this.message.user;
        };
        if (this.opponent.bot) return this.sendMessage('Bạn không thể chơi với bot!');
        // if (this.opponent.id === this.message.author.id) return this.sendMessage('Bạn không thể chơi với chính mình!');
        if(await verify(this.options)) {
            this.Connect4Game();
        };
    }

    async Connect4Game() {
        for (let y = 0; y < HEIGHT; y++) {
          for (let x = 0; x < WIDTH; x++) {
            this.gameBoard[y * WIDTH + x] = '⚪';
          };
        };
        this.inGame = true;
        this.ButtonInteraction(await this.sendMessage({
          embeds: [this.GameEmbed()], 
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setStyle('Primary').setEmoji('1️⃣').setCustomId('1_connect4'),
              new ButtonBuilder().setStyle('Primary').setEmoji('2️⃣').setCustomId('2_connect4'),
              new ButtonBuilder().setStyle('Primary').setEmoji('3️⃣').setCustomId('3_connect4'),
              new ButtonBuilder().setStyle('Primary').setEmoji('4️⃣').setCustomId('4_connect4')
            ),
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setStyle('Primary').setEmoji('5️⃣').setCustomId('5_connect4'),
              new ButtonBuilder().setStyle('Primary').setEmoji('6️⃣').setCustomId('6_connect4'),
              new ButtonBuilder().setStyle('Primary').setEmoji('7️⃣').setCustomId('7_connect4')
            ),
          ],
        }));  
    }

    GameEmbed() {
      return new EmbedBuilder() 
      .setColor(this.options.embed.color)
      .setTitle(this.options.embed.title)
      .setDescription(this.getGameBoard())
      .addFields({ name: this.options.embed.statusTitle || 'Trạng thái', value: this.options.turnMessage.replace('{emoji}', this.getChip()).replace('{player}', this.redTurn ? this.message.author.tag : this.opponent.tag)})
      .setFooter({ text: `${this.message.author.username} vs ${this.opponent.username}`, iconURL: this.message.guild.iconURL({ dynamic: true }) })
    } 

    ButtonInteraction(msg) {
        const collector = msg.createMessageComponentCollector({ idle: 60000 });
        collector.on('collect', async btn => {
            if(btn.user.id !== this.message.author.id && btn.user.id !== this.opponent.id) return btn.reply({
              content: this.options.othersMessage.replace('{author}', this.message.author.tag + 'và' + this.opponent.tag),  ephemeral: true
            });
            const turn = this.redTurn ? this.message.author.id : this.opponent.id;
            if (btn.user.id !== turn) return btn.reply({ 
              content: this.options.waitMessage,  ephemeral: true
            });
            await btn.deferUpdate();
            const id = btn.customId.split('_')[0];
            const column = parseInt(id) - 1;
            let placedX = -1;
            let placedY = -1;
            for (let y = HEIGHT - 1; y >= 0; y--) {
                const chip = this.gameBoard[column + (y * WIDTH)];
                if (chip === '⚪') {
                    this.gameBoard[column + (y * WIDTH)] = this.getChip();
                    placedX = column;
                    placedY = y;
                    break;
                }
            }
            if(placedY == 0) {
                if (column > 3) {
                    msg.components[1].components[column % 4].disabled = true;
                } else {
                  try {
                    msg.components[0].components[column].disabled = true;
                  } catch(e) {
                    this.message.reply({ content: "Bạn đã vượt quá số ô cho phép" }).then((msg) => {
                      setTimeout(() => msg.delete(), 3000);
                    });
                  };
                };
            };
            
            if(this.hasWon(placedX, placedY)) {
              this.inGame = false;
              return msg.edit({ embeds: [new EmbedBuilder()
                .setColor(this.options.embed.color)
                .setTitle(this.options.embed.title)
                .setDescription(this.getGameBoard())
                .addFields({ name: this.options.embed.statusTitle || 'Trạng thái', value: this.getResultText({ result: 'winner', name: btn.user.tag, emoji: this.getChip() }) })
                .setFooter({ text: `${this.message.author.username} vs ${this.opponent.username}`, iconURL: this.message.guild.iconURL({ dynamic: true })})
              ], components: disableButtons(msg.components) }); 
            } else if(this.isBoardFull()) {
              this.inGame = false;
              return msg.edit({ embeds: [new EmbedBuilder()
                .setColor(this.options.embed.color)
                .setTitle(this.options.embed.title)
                .setDescription(this.getGameBoard())
                .addFields({ 
                  name: this.options.embed.statusTitle || 'Trạng thái', 
                  value: this.getResultText({ result: 'tie' })
                })
                .setFooter({ text: `${this.message.author.username} vs ${this.opponent.username}`, iconURL: this.message.guild.iconURL({ dynamic: true }) })
              ], components: disableButtons(msg.components) });
            } else {
              this.redTurn = !this.redTurn;
              msg.edit({ embeds: [this.GameEmbed()], components: msg.components });
            };
        });
        collector.on('end', async(c, r) => {
          if(r === 'idle' && this.inGame == true) return msg.edit({ embeds: [new EmbedBuilder()
            .setColor(this.options.embed.color)
            .setTitle(this.options.embed.title)
            .setDescription(this.getGameBoard())
            .addFields({ 
              name: this.options.embed.statusTitle || 'Trạng thái', 
              value: this.getResultText({ result: 'timeout' })
            })
            .setFooter({ text: `${this.message.author.username} vs ${this.opponent.username}`, iconURL: this.message.guild.iconURL({ dynamic: true }) })
          ], components: disableButtons(msg.components) });
        });
    }
    hasWon(placedX, placedY) {
        const chip = this.getChip();
        const gameBoard = this.gameBoard;
        //Kiểm tra ngang
        const y = placedY * WIDTH;
        for (var i = Math.max(0, placedX - 3); i <= placedX; i++) {
            var adj = i + y;
            if (i + 3 < WIDTH) {
                if (gameBoard[adj] === chip && gameBoard[adj + 1] === chip && gameBoard[adj + 2] === chip && gameBoard[adj + 3] === chip)
                    return true;
            }
        }
        //Kiểm tra dọc
        for (var i = Math.max(0, placedY - 3); i <= placedY; i++) {
            var adj = placedX + (i * WIDTH);
            if (i + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH] === chip && gameBoard[adj + (2 * WIDTH)] === chip && gameBoard[adj + (3 * WIDTH)] === chip)
                    return true;
            }
        }
        //Đường chéo tăng dần
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY + i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH + 1] === chip && gameBoard[adj + (2 * WIDTH) + 2] === chip && gameBoard[adj + (3 * WIDTH) + 3] === chip)
                    return true;
            }
        }
        //Đường chéo giảm dần
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY - i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY - 3 >= 0) {
              if (gameBoard[adj] === chip && gameBoard[adj - WIDTH + 1] === chip && gameBoard[adj - (2 * WIDTH) + 2] === chip && gameBoard[adj - (3 * WIDTH) + 3] === chip) return true;
            }
        }
        return false;
    }
    getChip() {
      return this.redTurn ? this.emojis.player1 : this.emojis.player2;
    }

    isBoardFull() {
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          if(this.gameBoard[y * WIDTH + x] === '⚪') return false;
        };
      };
      return true;
    }

    getResultText(result) {
        if(result.result === 'tie') {
            return this.options.drawMessage;
        } else if(result.result === 'timeout') {
            return this.options.gameEndMessage;
        } else if(result.result === 'error') {
            return 'ERROR: ' + result.error;
        } else {
            return this.options.winMessage.replace('{emoji}', result.emoji).replace('{winner}', result.name);
        };
    }
};

async function verify(options) {
    return new Promise(async(res, rej) => {
        const message = options.message;
      	const opponent = options.opponent;

        const askEmbed = new EmbedBuilder()
        .setTitle(options.embed.askTitle || options.embed.title)
        .setDescription(options.askMessage
            .replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString())
        )
        .setColor(options.colors?.green || options.embed.color)
    
        const btn1 = new ButtonBuilder().setLabel(options.buttons?.accept || 'Chấp nhận').setStyle('Success').setCustomId('accept')
        const btn2 = new ButtonBuilder().setLabel(options.buttons?.reject || 'Từ chối').setStyle('Danger').setCustomId('reject')
        const row = new ActionRowBuilder().addComponents(btn1, btn2);
    
    
    	let askMsg;
    	if (options.slash_command) askMsg = await message.editReply({ embeds: [askEmbed], components: [row] })
        else askMsg = await message.channel.send({ embeds: [askEmbed], components: [row] })
    
        const filter = (interaction) => interaction === interaction;
        const interaction = askMsg.createMessageComponentCollector({
            filter, time: 30000
        })
    
        
        await interaction?.on('collect', async (btn) => {
            if (btn.user.id !== opponent.id) return btn.reply({ content: options.othersMessage.replace('{author}', opponent.tag),  ephemeral: true })
    
            await btn.deferUpdate();
            interaction?.stop(btn.customId)
        });
    
    
        await interaction?.on('end', (_, r) => {
            if (r === 'accept') {
                if (!options.slash_command) askMsg.delete().catch();
                return res(true)
            }

            const cancelEmbed = new EmbedBuilder()
            .setTitle(options.embed.cancelTitle || options.embed.title)
            .setDescription(options.cancelMessage
                .replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString())
            )
            .setColor(options.colors?.red || options.embed.color)

            if (r === 'time') {
                cancelEmbed.setDescription(options.timeEndMessage
                    .replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString())
                )
            }
            res(false)
            return askMsg.edit({ embeds: [cancelEmbed], components: disableButtons(askMsg.components) });
        });
    })
}

const path = require("node:path");
module.exports = {
  name: path.parse(__filename).name,
  usage: `${path.parse(__filename).name}`,
  aliases: ["", ""], // lệnh phụ
  description: "", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: false, //: tắt // true : bật
  category:"Game", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, database, prefix) => {
    const opponent = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!opponent) return message.reply({ content: "Bạn vẫn chưa đề cập đến người bạn muốn chơi cùng" });
    new Connect4Game({
            message: message,
            slashCommand: false,
            opponent: opponent.user,
            embed: {
              title: 'Connect 4',
              color: "Random",
            },
            emojis: {
              player1: '🔵',
              player2: '🟡'
            },
            waitMessage: 'Chờ đợi đối thủ...',
            turnMessage: '{emoji} | Đến lượt người chơi **{player}**.',
            winMessage: '{emoji} | **{winner}** thắng trận đấu!',
            gameEndMessage: 'Trò chơi chưa hoàn thành :(',
            drawMessage: 'Đó là một trận hòa!',
            othersMessage: 'Bạn không được phép sử dụng các nút cho tin nhắn này!',
            askMessage: 'Hey {opponent}, {challenger} đã thách đấu bạn trong trò chơi connect4!',
            cancelMessage: 'Có vẻ như họ đã từ chối chơi trò chơi Connect4. \:(',
            timeEndMessage: 'Vì đối thủ không trả lời, tôi đã bỏ trò chơi',
    }).startGame()
  },
};