const SoftUI = require('dbd-soft-ui');
const language = require("./language.js");

const theme = (client, config) => {
  let Music = [];
  client.commands.map((command) => {
    Music.push({
      commandName: `${config.prefix + command.name}`,
      commandUsage: command.usage || "Không sử dụng",
      commandDescription: command.description || "Không có mô tả",
    });
  });
  return SoftUI({
      websiteName: "BlackCat-Club", // Tên trang web
      colorScheme: "pink", // theme
      supporteMail: config.dashboard.supporteMail, // email hỗ trợ
      locales: language, // thiết lập ngôn ngữ cho dashboard
      customThemeOptions: {
        index: async({ req, res, config }) => {
            const cards = [
                {
                    title: "CPU",
                    icon: "single-02",
                    getValue: "Title",
                    progressBar: {
                        enabled: false,
                        getProgress: 50 // 0 - 100 (get a percentage of the progress)
                    }
                }
                // Include 3 more cards
            ];
            const graph = {
                values: [690, 524, 345, 645, 478, 592, 468, 783, 459, 230, 621, 345],
                labels: ["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "10m"]
            };
            return {
                cards,
                graph
            };
        },
      },
      // Icons
      icons: {
        favicon: client.user?.displayAvatarURL({ size: 4096 }),
        noGuildIcon: "https://pnggrid.com/wp-content/uploads/2021/05/Discord-Logo-Circle-1024x1024.png",
        sidebar: {
          darkUrl: client.user?.displayAvatarURL({ size: 4096 }),
          lightUrl: client.user?.displayAvatarURL({ size: 4096 }),
          hideName: true,
          borderRadius: false,
          alignCenter: true,
        },
      },
      index: {
        card: {
          category: "Soft UI",
          title: "Trợ lý - Trung tâm của mọi thứ",
          description: `
            <b>
              <i>${client.user.username}</i>
            </b>
          `,
          image: "https://media.discordapp.net/attachments/1092828708798214284/1092828811818709113/music.gif",
          link: {
            enabled: true,
            url: "https://www.facebook.com/BlackCat.2k3"
          }
        },
        graph: {
          enabled: true,
          lineGraph: false,
          title: 'Memory Usage',
          tag: 'Memory (MB)',
          max: 100
        },
      },
      sweetalert: {
        errors: {},
        success: {
          login: "Đã đăng nhập thành công.",
        }
      },
      preloader: {
        image: "https://media.discordapp.net/attachments/1092828708798214284/1092828811818709113/music.gif",
        spinner: false,
        text: "Loading ...",
      },
      admin: {
        pterodactyl: {
          enabled: false,
          apiKey: "apiKey",
          panelLink: "https://panel.website.com",
          serverUUIDs: []
        }
      },
      commands: [
        {
					category: "Music",
					subTitle: "Music Commands",
					aliasesDisabled: false,
					list: Music,
				},
      ],
      footer: {
        replaceDefault: true,
        text: client.user.username,
      },
  });
};

module.exports = theme;