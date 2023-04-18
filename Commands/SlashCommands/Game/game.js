const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType } = require("discord.js");
const { RPSGame, Slots } = require(`${process.cwd()}/Events/Game`);
module.exports = {
  name: "game",
  description: "play game",
  userPerms: [],
  options: [
    {
      name: "slots",
      description: "Chơi game slots",
      type: ApplicationCommandOptionType.Subcommand,
    },{
      name: "tictactoe",
      description: "Chơi game tictactoe cùng bạn bè",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "user",
          description: "Bạn muốn chơi cùng với ai ?",
          type: ApplicationCommandOptionType.User,
          required: false,
      }],
    },{
      name: "rps",
      description: "Chơi game rps cùng bạn bè",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
          name: "user",
          description: "Bạn muốn chơi cùng với ai ?",
          type: ApplicationCommandOptionType.User,
          required: true,
      }],
    },
  ],
  run: async(client, interaction) => {
    try {
      if(interaction.options.getSubcommand() === "tictactoe") {
        const TicTacToe = require("discord-tictactoe");
        const game = new TicTacToe({ language: 'vi', commandOptionName: 'user' });
        game.handleInteraction(interaction);
      } else if(interaction.options.getSubcommand() === "slots") {
        const Game = new Slots(client, {
          message: interaction,
          slashCommands: true,
          embed: {
           title: 'Slot Machine',
           color: '#5865F2'
          },
          slots: ['🍇', '🍊', '🍋', '🍌']
        });
        Game.startGame();
      } else if(interaction.options.getSubcommand() === "rps") {
        const game = new RPSGame({
          message: interaction,
          slashCommand: true,
          opponent: interaction.options.getUser('user'),
          embed: {
            title: 'Oẳn tù tì',
            description: 'Nhấn một nút bên dưới để thực hiện một sự lựa chọn!',
            color: "Red",
          },
          buttons: {
            rock: 'Búa',
            paper: 'Giấy',
            scissors: 'Kéo',
          },
          emojis: {
            rock: '🌑',
            paper: '📃',
            scissors: '✂️',
          },
          othersMessage: 'Bạn không được phép sử dụng các nút cho tin nhắn này!',
          chooseMessage: 'bạn chọn {emoji}!',
          noChangeMessage: 'Bạn không thể thay đổi lựa chọn của mình!',
          askMessage: 'Này {opponent}, {challenger} đã thách đấu bạn trong trò chơi Oẳn tù tì!',
          cancelMessage: 'Có vẻ như họ từ chối chơi trò Oẳn tù tì. \:(',
          timeEndMessage: 'Vì đối thủ không trả lời, tôi đã bỏ trò chơi!',
          drawMessage: 'Đó là một trận hòa!',
          winMessage: '{winner} thắng trận đấu!',
          gameEndMessage: 'Trò chơi chưa hoàn thành :(',
        })
        game.startGame();
      };
    } catch(e) {
      return console.log(e);
    };
  },
};