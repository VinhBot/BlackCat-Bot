const { StringSelectMenuBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const path = require("node:path");

module.exports = {
  name: path.parse(__filename).name,
  usage: path.parse(__filename).name,
  aliases: [""], // lệnh phụ
  description: "", // mô tả lệnh
  userPerms: [], // Administrator, ....
  owner: true, //: tắt // true : bật
  category:"Developer", // tên folder chứa lệnh
  cooldown: 5, // thời gian có thể tái sử dụng lệnh
  run: async(client, message, args, prefix) => {
    embedCreate(client, message);
  },
};

function embedCreate(client, message, options = {}) {
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                const done = new ButtonBuilder().setLabel('Hoàn thành').setStyle('Success').setCustomId('setDone');
                const reject = new ButtonBuilder().setLabel('Hủy bỏ').setStyle('Danger').setCustomId('setDelete');
                const menuOp = [
                    {
                        name: 'Message',
                        desc: 'Tin nhắn bên ngoài embed',
                        value: 'setMessage'
                    },
                    {
                        name: 'Author',
                        desc: 'Đặt author cho embed',
                        value: 'setAuthor'
                    },
                    {
                        name: 'Title',
                        desc: 'Đặt tiêu đề trong phần embed',
                        value: 'setTitle'
                    },
                    {
                        name: 'URL',
                        desc: 'Đặt URL cho Tiêu đề trong phần embed',
                        value: 'setURL'
                    },
                    {
                        name: 'Description',
                        desc: 'Đặt mô tả trong phần embed',
                        value: 'setDescription'
                    },
                    {
                        name: 'Color',
                        desc: 'Đặt màu của embed',
                        value: 'setColor'
                    },
                    {
                        name: 'Image',
                        desc: 'Đặt hình ảnh cho embed',
                        value: 'setImage'
                    },
                    {
                        name: 'Thumbnail',
                        desc: 'Đặt Thumbnail trong phần embed',
                        value: 'setThumbnail'
                    },
                    {
                        name: 'Footer',
                        desc: 'Đặt footer trong phần embed',
                        value: 'setFooter'
                    },
                    {
                        name: 'Timestamp',
                        desc: 'Bật Dấu thời gian của nội dung embed',
                        value: 'setTimestamp'
                    }
                ];
                const menuOptions = [];
                if(!options.embed) {
                    options.embed = {
                        footer: { text: client.user.username, iconURL: client.user.displayAvatarURL() },
                        color: '#075FFF',
                        credit: true
                    };
                };
                for (let i = 0; i < menuOp.length; i++) {
                    const dataopt = {
                        label: menuOp[i].name,
                        description: menuOp[i].desc,
                        value: menuOp[i].value
                    };
                    menuOptions.push(dataopt);
                }
                const slct = new StringSelectMenuBuilder()
                    .setMaxValues(1)
                    .setCustomId('embed-creator')
                    .setPlaceholder('Embed Creator')
                    .addOptions(menuOptions);
                const row = new ActionRowBuilder().addComponents([done, reject]);
                const row2 = new ActionRowBuilder().addComponents([slct]);
                const embed = new EmbedBuilder()
                    .setTitle(((_a = options.embed) === null || _a === void 0 ? void 0 : _a.title) || 'Embed Creator')
                    .setDescription(((_b = options.embed) === null || _b === void 0 ? void 0 : _b.description) ||
                    'Chọn bất kỳ ***tùy chọn*** nào từ Menu Chọn trong thư này để tạo bản embed tùy chỉnh cho bạn.\n\nĐây là bản embed hoàn chỉnh.')
                    .setImage('https://media.discordapp.net/attachments/885411032128978955/955066865347076226/unknown.png')
                    .setColor(((_c = options.embed) === null || _c === void 0 ? void 0 : _c.color) || '#075FFF')
                    .setFooter(((_d = options.embed) === null || _d === void 0 ? void 0 : _d.credit) === false
                    ? (_e = options.embed) === null || _e === void 0 ? void 0 : _e.footer
                    : { text: client.user.username, iconURL: client.user.displayAvatarURL() });
                if ((_f = options.embed) === null || _f === void 0 ? void 0 : _f.author) {
                    embed.setAuthor(options.embed.author);
                };
                let interaction;
                if (message.commandId) {
                    interaction = message;
                }
                let msg;
                const int = message;
                const ms = message;
                if (interaction) {
                    yield int.followUp({ embeds: [options.rawEmbed || embed], components: [row2, row] });
                    msg = yield int.fetchReply();
                } else if(!interaction) {
                    msg = yield ms.reply({ embeds: [options.rawEmbed || embed], components: [row2, row] });
                };
                const previewEmbed = new EmbedBuilder().setFooter(((_g = options.embed) === null || _g === void 0 ? void 0 : _g.credit) === false ? (_h = options.embed) === null || _h === void 0 ? void 0 : _h.footer : { text: client.user.username, iconURL: client.user.displayAvatarURL() }).setColor('#2F3136');
                message.channel.send({ content: '** **', embeds: [previewEmbed] }).then((preview) => __awaiter(this, void 0, void 0, function* () {
                    const collector = msg.createMessageComponentCollector({
                        filter: (m) => m.user.id === message.member.user.id,
                        idle: 1000 * 60 * 3
                    });
                    collector.on('collect', (button) => __awaiter(this, void 0, void 0, function* () {
                        const fitler = (m) => message.member.user.id === m.author.id;
                        const btnfilt = (m) => message.member.user.id === m.user.id;
                        if(button.customId && button.customId === 'setDelete') {
                            button.reply({ content: 'Hủy bỏ Sáng tạo.', ephemeral: true });
                            preview.delete().catch(() => { });
                            msg.delete().catch(() => { });
                        } else if(button.customId && button.customId === 'setDone') {
                            if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                                button.reply({
                                    content: 'Cung cấp cho tôi kênh để gửi bản embed.',
                                    ephemeral: true
                                });
                                const titleclr = button.channel.createMessageCollector({
                                    filter: fitler,
                                    time: 30000,
                                    max: 1
                                });
                                titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                    if (m.mentions.channels.first()) {
                                        const ch = m.mentions.channels.first();
                                        button.editReply({ content: 'Xong 👍', ephemeral: true });
                                        ch.send({
                                            content: preview.content,
                                            embeds: [preview.embeds[0]]
                                        });
                                        preview.delete().catch(() => { });
                                        msg.delete().catch(() => { });
                                        m.delete().catch(() => { });
                                        resolve(preview.embeds[0].toJSON());
                                    }
                                }));
                            } else if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                                button.reply({ content: 'Xong 👍', ephemeral: true });
                                message.channel.send({
                                    content: preview.content,
                                    embeds: [preview.embeds[0]]
                                });
                                preview.delete().catch(() => { });
                                msg.delete().catch(() => { });
                                resolve(preview.embeds[0].toJSON());
                            }
                        } else if(button.values[0] === 'setTimestamp') {
                            const btn = new ButtonBuilder().setLabel('Bật').setCustomId('timestamp-yes').setStyle('Success');
                            const btn2 = new ButtonBuilder().setLabel('Tắt').setCustomId('timestamp-no').setStyle('Danger');
                            button.reply({
                                content: 'Bạn có muốn có thêm thời gian trong phần embed không ?',
                                ephemeral: true,
                                components: [new ActionRowBuilder().addComponents([btn, btn2])]
                            });
                            const titleclr = button.channel.createMessageComponentCollector({
                                filter: btnfilt,
                                idle: 60000
                            });
                            titleclr.on('collect', (btn) => __awaiter(this, void 0, void 0, function* () {
                                if(btn.customId === 'timestamp-yes') {
                                    button.editReply({
                                        components: [],
                                        content: 'Đã bật timestamp khi embed'
                                    });
                                    preview.edit({
                                        content: preview.content,
                                        embeds: [previewEmbed.setTimestamp(new Date())]
                                    }).catch(() => { });
                                }
                                if(btn.customId === 'timestamp-no') {
                                    button.editReply({
                                        components: [],
                                        content: 'Timestamp bị vô hiệu hóa khi embed'
                                    });
                                    preview.edit({
                                        content: preview.content,
                                        embeds: [previewEmbed.setTimestamp(null)]
                                    }).catch(() => { });
                                };
                            }));
                        } else if (button.values[0] === 'setAuthor') {
                            const autsel = new StringSelectMenuBuilder()
                                .setMaxValues(1)
                                .setCustomId('author-selct')
                                .setPlaceholder('Author Options')
                                .addOptions([
                                {
                                    label: 'Đặt tên author',
                                    description: 'Đặt tên author',
                                    value: 'author-name'
                                },
                                {
                                    label: 'Đặt icon author',
                                    description: 'Đặt icons author',
                                    value: 'author-icon'
                                },
                                {
                                    label: 'Đặt author URL',
                                    description: 'Đặt url author',
                                    value: 'author-url'
                                }
                            ]);
                            button.reply({
                                content: 'Chọn một từ các tùy chọn "Author"',
                                ephemeral: true,
                                components: [new ActionRowBuilder().addComponents([autsel])]
                            });
                            const titleclr = button.channel.createMessageComponentCollector({
                                filter: btnfilt,
                                idle: 60000
                            });
                            titleclr.on('collect', (menu) => __awaiter(this, void 0, void 0, function* () {
                                yield menu.deferUpdate();
                                if (menu.customId !== 'author-selct') return;
                                if (menu.values[0] === 'author-name') {
                                    button.editReply({
                                        content: 'Gửi cho tôi tên author',
                                        ephemeral: true,
                                        components: []
                                    });
                                    const authclr = button.channel.createMessageCollector({
                                        filter: fitler,
                                        time: 30000,
                                        max: 1
                                    });
                                    authclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                        var _j, _k, _l, _m;
                                        titleclr.stop();
                                        m.delete().catch(() => { });
                                        preview.edit({
                                            content: preview.content,
                                            embeds: [EmbedBuilder.from(preview.embeds[0]).setAuthor({
                                              name: m.content,
                                              iconURL: ((_j = EmbedBuilder.from(preview.embeds[0]).author) === null || _j === void 0 ? void 0 : _j.iconURL) ? (_k = EmbedBuilder.from(preview.embeds[0]).author) === null || _k === void 0 ? void 0 : _k.iconURL : null,
                                              url: ((_l = EmbedBuilder.from(preview.embeds[0]).author) === null || _l === void 0 ? void 0 : _l.url) ? (_m = EmbedBuilder.from(preview.embeds[0]).author) === null || _m === void 0 ? void 0 : _m.url : null
                                            })]
                                        }).catch(() => { });
                                    }));
                                }
                                if(menu.values[0] === 'author-icon') {
                                    button.editReply({
                                        content: 'Gửi cho tôi (ảnh/URL ảnh)',
                                        ephemeral: true,
                                        components: []
                                    });
                                    const authclr = button.channel.createMessageCollector({
                                        filter: fitler,
                                        time: 30000,
                                        max: 1
                                    });
                                    authclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                      try {
                                        var _o, _p, _q, _r, _s, _t;
                                        const isthumb = m.content.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null || ((_o = m.attachments.first()) === null || _o === void 0 ? void 0 : _o.url) || '';
                                        if(!isthumb) return button.followUp({
                                          content: 'Đây không phải là URL hình ảnh/Đính kèm hình ảnh. Vui lòng cung cấp một hình ảnh hợp lệ.',
                                          ephemeral: true
                                        });
                                        titleclr.stop();
                                        m.delete().catch(() => { });
                                        preview.edit({
                                            content: preview.content,
                                            embeds: [EmbedBuilder.from(preview.embeds[0]).setAuthor({
                                                    name: ((_p = EmbedBuilder.from(preview.embeds[0]).author) === null || _p === void 0 ? void 0 : _p.name)
                                                        ? (_q = EmbedBuilder.from(preview.embeds[0]).author) === null || _q === void 0 ? void 0 : _q.name
                                                        : '',
                                                    iconURL: m.content || ((_r = m.attachments.first()) === null || _r === void 0 ? void 0 : _r.url) || '',
                                                    url: ((_s = EmbedBuilder.from(preview.embeds[0]).author) === null || _s === void 0 ? void 0 : _s.url)
                                                        ? (_t = EmbedBuilder.from(preview.embeds[0]).author) === null || _t === void 0 ? void 0 : _t.url
                                                        : ''
                                            })]
                                        }).catch(() => console.log("lỗi author-icon"));
                                      } catch(e) {
                                        console.log(e)
                                        preview.reply({ content: "Đã sảy ra lỗi vui lòng quay lại sau" });
                                      };
                                    }));
                                }
                                if(menu.values[0] === 'author-url') {
                                    button.editReply({
                                        content: 'Gửi cho tôi một Url HTTPS',
                                        ephemeral: true,
                                        components: []
                                    });
                                    const authclr = button.channel.createMessageCollector({
                                        filter: fitler,
                                        time: 30000,
                                        max: 1
                                    });
                                    authclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                        var _u, _v, _w, _x;
                                        if (!m.content.startsWith('http')) {
                                            m.delete().catch(() => { });
                                            return button.editReply({
                                             content: 'Một URL phải bắt đầu bằng giao thức http. Vui lòng cung cấp một URL hợp lệ.'
                                            });
                                        } else {
                                            titleclr.stop();
                                            m.delete().catch(() => { });
                                            preview.edit({
                                                content: preview.content,
                                                embeds: [EmbedBuilder.from(preview.embeds[0]).setAuthor({
                                                        name: ((_u = EmbedBuilder.from(preview.embeds[0]).author) === null || _u === void 0 ? void 0 : _u.name)
                                                            ? (_v = EmbedBuilder.from(preview.embeds[0]).author) === null || _v === void 0 ? void 0 : _v.name
                                                            : '',
                                                        iconURL: ((_w = EmbedBuilder.from(preview.embeds[0]).author) === null || _w === void 0 ? void 0 : _w.iconURL)
                                                            ? (_x = EmbedBuilder.from(preview.embeds[0]).author) === null || _x === void 0 ? void 0 : _x.iconURL
                                                            : '',
                                                        url: m.content || ''
                                                    })
                                                ]
                                            }).catch(() => { });
                                        }
                                    }));
                                }
                            }));
                        } else if(button.values[0] === 'setMessage') {
                            button.reply({
                                content: 'Cho tôi biết văn bản bạn muốn cho tin nhắn bên ngoài embed',
                                ephemeral: true
                            });
                            const titleclr = button.channel.createMessageCollector({
                                filter: fitler,
                                time: 30000,
                                max: 1
                            });
                            titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                titleclr.stop();
                                m.delete().catch(() => { });
                                preview.edit({ content: m.content, embeds: [preview.embeds[0]] }).catch(() => { });
                            }));
                        } else if (button.values[0] === 'setThumbnail') {
                            button.reply({
                                content: 'Gửi cho tôi một hình ảnh (nó sẽ là hình ảnh nhỏ ở trên cùng bên phải)',
                                ephemeral: true
                            });
                            const titleclr = button.channel.createMessageCollector({
                                filter: fitler,
                                time: 30000,
                                max: 1
                            });
                            titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                var _y, _z;
                                const isthumb = m.content.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null || ((_y = m.attachments.first()) === null || _y === void 0 ? void 0 : _y.url) || '';
                                if(!isthumb) return button.followUp({
                                  content: 'Đây không phải là một url hình ảnh. Vui lòng cung cấp url hình ảnh hoặc tệp đính kèm.',
                                  ephemeral: true
                                });
                                titleclr.stop();
                                m.delete().catch(() => { });
                                preview.edit({
                                    content: preview.content,
                                    embeds: [previewEmbed.setThumbnail(m.content || ((_z = m.attachments.first()) === null || _z === void 0 ? void 0 : _z.url) || '')]
                                }).catch(() => { });
                            }));
                        }
                        else if (button.values[0] === 'setColor') {
                            button.reply({
                                content: 'Cho tôi biết màu bạn muốn cho vào embed là gì ?',
                                ephemeral: true
                            });
                            const titleclr = button.channel.createMessageCollector({
                                filter: fitler,
                                time: 30000
                            });
                            titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                if (/^#[0-9A-F]{6}$/i.test(m.content)) {
                                    m.delete().catch(() => { });
                                    titleclr.stop();
                                    preview.edit({
                                        content: preview.content,
                                        embeds: [previewEmbed.setColor(m.content)]
                                    }).catch(() => {
                                        button.followUp({
                                            content: 'Vui lòng cung cấp cho tôi mã hex hợp lệ',
                                            ephemeral: true
                                        });
                                    });
                                } else {
                                    yield button.followUp({
                                        content: 'Vui lòng cung cấp cho tôi mã hex hợp lệ',
                                        ephemeral: true
                                    });
                                }
                            }));
                        } else if(button.values[0] === 'setURL') {
                            button.reply({
                                content: 'Cho tôi biết bạn muốn URL nào cho tiêu đề embed (siêu liên kết cho tiêu đề embed)',
                                ephemeral: true
                            });
                            const titleclr = button.channel.createMessageCollector({
                                filter: fitler,
                                time: 30000,
                                max: 1
                            });
                            titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                if (!m.content.startsWith('http')) {
                                    m.delete().catch(() => { });
                                    return button.editReply('Một URL phải bắt đầu bằng giao thức http. Vui lòng cung cấp một URL hợp lệ.');
                                } else {
                                    m.delete().catch(() => { });
                                    titleclr.stop();
                                    preview.edit({
                                        content: preview.content,
                                        embeds: [previewEmbed.setURL(m.content)]
                                    }).catch(() => { });
                                }
                            }));
                        } else if (button.values[0] === 'setImage') {
                            button.reply({
                                content: 'Gửi cho tôi hình ảnh bạn cần để đưa vào embed',
                                ephemeral: true
                            });
                            const titleclr = button.channel.createMessageCollector({
                                filter: fitler,
                                time: 30000,
                                max: 1
                            });
                            titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                var _0, _1;
                                const isthumb = m.content.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null || ((_0 = m.attachments.first()) === null || _0 === void 0 ? void 0 : _0.url) || '';
                                if(!isthumb) return message.reply({
                                  content: 'Đó không phải là url hình ảnh/tệp đính kèm hình ảnh. Vui lòng cung cấp cho tôi url hình ảnh hoặc tệp đính kèm.'
                                });
                                m.delete().catch(() => { });
                                titleclr.stop();
                                preview.edit({
                                    content: preview.content,
                                    embeds: [previewEmbed.setImage(m.content || ((_1 = m.attachments.first()) === null || _1 === void 0 ? void 0 : _1.url))]
                                }).catch(() => { });
                            }));
                        } else if (button.values[0] === 'setTitle') {
                            button.reply({
                                content: 'Cho tôi biết văn bản bạn muốn đưa lên tiêu đề embed',
                                ephemeral: true
                            });
                            const titleclr = button.channel.createMessageCollector({
                                filter: fitler,
                                time: 30000,
                                max: 1
                            });
                            titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                m.delete().catch(() => { });
                                titleclr.stop();
                                preview.edit({
                                    content: preview.content,
                                    embeds: [previewEmbed.setTitle(m.content)]
                                }).catch(() => { });
                            }));
                        } else if (button.values[0] === 'setDescription') {
                            button.reply({
                                content: 'Hãy cho tôi biết bạn cần văn bản nào cho mô tả embed',
                                ephemeral: true
                            });
                            const titleclr = button.channel.createMessageCollector({
                                filter: fitler,
                                time: 30000,
                                max: 1
                            });
                            titleclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                m.delete().catch(() => { });
                                titleclr.stop();
                                preview.edit({
                                    content: preview.content,
                                    embeds: [previewEmbed.setDescription(m.content)]
                                }).catch(() => { });
                            }));
                        } else if (button.values[0] === 'setFooter') {
                            const autsel = new StringSelectMenuBuilder()
                                .setMaxValues(1)
                                .setCustomId('footer-selct')
                                .setPlaceholder('Footer Options')
                                .addOptions([
                                {
                                    label: 'Footer name',
                                    description: 'Đặt tên footer',
                                    value: 'footer-name'
                                },
                                {
                                    label: 'Footer icon',
                                    description: 'Đặt biểu tượng footer',
                                    value: 'footer-icon'
                                }
                            ]);
                            button.reply({
                                content: 'Chọn một trong các tùy chọn "Footer"',
                                ephemeral: true,
                                components: [new ActionRowBuilder().addComponents([autsel])]
                            });
                            const titleclr = button.channel.createMessageComponentCollector({
                                filter: btnfilt,
                                idle: 60000
                            });
                            titleclr.on('collect', (menu) => __awaiter(this, void 0, void 0, function* () {
                                yield menu.deferUpdate();
                                if (menu.customId !== 'footer-selct') return;
                                if (menu.values[0] === 'footer-name') {
                                    button.editReply({
                                        content: 'Gửi cho tôi tên Footer',
                                        ephemeral: true,
                                        components: []
                                    });
                                    const authclr = button.channel.createMessageCollector({
                                        filter: fitler,
                                        time: 30000,
                                        max: 1
                                    });
                                    authclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                        titleclr.stop();
                                        m.delete().catch(() => { });
                                        preview.edit({
                                            content: preview.content,
                                            embeds: [previewEmbed.setFooter({ text: m.content, iconURL: preview.embeds[0].footer.iconURL || "" })]
                                        }).catch(() => { });
                                    }));
                                }
                                if (menu.values[0] === 'footer-icon') {
                                    button.editReply({
                                        content: 'Gửi cho tôi ảnh trực tiếp hoặc URL Ảnh',
                                        ephemeral: true,
                                        components: []
                                    });
                                    const authclr = button.channel.createMessageCollector({
                                        filter: fitler,
                                        time: 30000,
                                        max: 1
                                    });
                                    authclr.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                                        var _4, _6;
                                        const isthumb = m.content.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null || ((_4 = m.attachments.first()) === null || _4 === void 0 ? void 0 : _4.url) || '';
                                        if(!isthumb) return button.followUp({
                                          content: 'Đây không phải là URL hình ảnh/Tệp đính kèm hình ảnh. Vui lòng cung cấp một hình ảnh hợp lệ.',
                                          ephemeral: true
                                        });
                                        titleclr.stop();
                                        m.delete().catch(() => { });
                                        preview.edit({
                                            content: preview.content,
                                            embeds: [previewEmbed.setFooter({ text: preview.embeds[0].footer.text || '', iconURL: m.content || ((_6 = m.attachments.first()) === null || _6 === void 0 ? void 0 : _6.url) || "" })]
                                        }).catch(() => { });
                                    }));
                                }
                            }));
                        }
                    }));
                    collector.on('end', (collected, reason) => __awaiter(this, void 0, void 0, function* () {
                        if(reason === 'time') {
                          yield msg.edit({ 
                            embeds: [msg.embeds[0]], 
                            components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Timed Out').setStyle('Danger').setCustomId('timeout|91817623842').setDisabled(true))] 
                          });
                        };
                    }));
                }));
            } catch (err) {
                console.log(`EmbedError: ${err.stack}`);
            }
        }));
    });
};