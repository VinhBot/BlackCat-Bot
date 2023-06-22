const { EmbedBuilder, StringSelectMenuBuilder, parseEmoji, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType, Collection, SelectMenuBuilder } = require("discord.js");
const { Inventory: inv, Currency: cs, Music } = require(`${process.cwd()}/Assets/Schemas/database`);
const fetch = require("node-fetch");
const config = require(`${process.cwd()}/config.json`);
// chỉnh sửa, rút gọn discord events
const customEvents = () => {
  /*========================================================
  # Chỉnh sửa rút gọn Embeds <Discord.EmbedBuilder>
  ========================================================*/
  const EmbedBuilders = class extends EmbedBuilder {
    constructor({ author, title, colors, fields, images, description, thumbnail, timestamp = false, footer }) {
      super();
      if(description) this.setDescription(description);
      if(thumbnail) this.setThumbnail(thumbnail);
      if(title?.name) this.setTitle(title.name);
      if(title?.url) this.setURL(title.url);
      if(timestamp) this.setTimestamp();
      if(fields) this.addFields(fields);
      if(author) this.setAuthor(author);
      if(footer) this.setFooter(footer);
      if(images) this.setImage(images);
      if(colors) this.setColor(colors);
    };
  };
  return { EmbedBuilders };
};
// tạo thời gian hồi lệnh
const onCoolDown = (cooldowns, message, commands) => {
  if (!message || !commands) return;
  let { member } = message;
  if(!cooldowns.has(commands.name)) {
    cooldowns.set(commands.name, new Collection());
  };
  const now = Date.now();
  const timestamps = cooldowns.get(commands.name);
  const cooldownAmount = commands.cooldown * 1000;
  if(timestamps.has(member.id)) {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;
    if(now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000; //có được thời gian còn lại
      return timeLeft;
    } else {
      timestamps.set(member.id, now);
      setTimeout(() => timestamps.delete(member.id), cooldownAmount);
      return false;
    };
  } else {
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
    return false;
  };
};
// Music embed
const musicEmbedDefault = (client, guilds) => {
    const guild = client.guilds.cache.get(guilds.id);
    const genshinGif = [
      "https://upload-os-bbs.hoyolab.com/upload/2021/08/12/64359086/ad5f51c6a4f16adb0137cbe1e86e165d_8637324071058858884.gif?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,gif",
    ];
    const randomGenshin = genshinGif[Math.floor(Math.random() * genshinGif.length)];
    var Emojis = [`0️⃣`, `1️⃣`];
    return {
      embeds: [
        new EmbedBuilder()
        .setColor("Random")
        .setTitle(`📃 hàng đợi của __${guild.name}__`)
        .setDescription(`**Hiện tại có __0 Bài hát__ trong Hàng đợi**`)
        .setThumbnail(guild.iconURL({ dynamic: true })),
        new EmbedBuilder()
        .setColor("Random")
        .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
        .setImage(randomGenshin)
        .setTitle(`Bắt đầu nghe nhạc, bằng cách kết nối với Kênh voice và gửi **LIÊN KẾT BÀI HÁT** hoặc **TÊN BÀI HÁT** trong Kênh này!`)
        .setDescription(`> *Tôi hỗ trợ Youtube, Spotify, Soundcloud và các liên kết MP3 trực tiếp!*`)
      ], components: [
        new ActionRowBuilder().addComponents([
          new StringSelectMenuBuilder().setCustomId(`StringSelectMenuBuilder`).addOptions([`Gaming`, `NCS | No Copyright Music`].map((t, index) => {
            return {
              label: t.substr(0, 25),
              value: t.substr(0, 25),
              description: `Tải Danh sách phát nhạc: '${t}'`.substr(0, 50),
              emoji: Emojis[index]
            };
          }))
        ]),
        new ActionRowBuilder({ 
          components: [
            new ButtonBuilder({ style: "Primary", customId: "1", emoji: "⏭", label: "Skip", disabled: true }),
            new ButtonBuilder({ style: "Danger", customId: "2", emoji: "🏠", label: "Stop", disabled: true }),
            new ButtonBuilder({ style: "Secondary", customId: "3", emoji: "⏸", label: "Pause", disabled: true }),
            new ButtonBuilder({ style: "Success", customId: "4", emoji: "🔁", label: "Autoplay", disabled: true }),
            new ButtonBuilder({ style: "Primary", customId: "5", emoji: "🔀", label: "Shuffle", disabled: true }),
          ] 
        }),
        new ActionRowBuilder({
          components: [
            new ButtonBuilder({ style: "Success", customId: "6", emoji: "🔁", label: "Song", disabled: true }),
            new ButtonBuilder({ style: "Success", customId: "7", emoji: "🔂", label: "Queue", disabled: true }),
            new ButtonBuilder({ style: "Primary", customId: "8", emoji: "⏩", label: "+10 Sec", disabled: true }),
            new ButtonBuilder({ style: "Primary", customId: "9", emoji: "⏪", label: "-10 Sec", disabled: true }),
            new ButtonBuilder({ style: "Primary", customId: "10", emoji: "📝", label: "Lyrics", disabled: true }),
          ] 
        }),
    ]};
};
// MusicRole
const MusicRole = (client, member, song) => {
    if(!client) return false; // nếu không có tin nhắn được thêm trở lại 
    var roleid = Music.findOne({ GuildId: member.guild.id }); // lấy quyền quản trị
    if(String(roleid) == "") return false; // nếu không có musicrole trả về false, để nó tiếp tục
    var isdj = false; // định nghĩa các biến
    for (let i = 0; i < roleid.length; i++) { // lặp qua các roles
        if(!member.guild.roles.cache.get(roleid[i])) continue; // nếu roles không tồn tại, hãy bỏ qua vòng lặp hiện tại này
        if (member.roles.cache.has(roleid[i])) isdj = true; // nếu anh ấy có vai trò được đặt var thành true
        // thêm roles vào chuỗi
    }
    // nếu không có dj và không phải là quản trị viên, hãy trả về chuỗi
    if (!isdj && !member.permissions.has("Administrator") && song.user.id != member.id) {
        if(!roleid) return;
        return roleid.map((i) => `<@&${i}>`).join(", ");
    // nếu anh ta là dj hoặc quản trị viên, thì hãy trả về false, điều này sẽ tiếp tục cmd
    } else {
        return false;
    };
};
/*========================================================
# baseURL
========================================================*/
const baseURL = async(url, options) => {
  const response = options ? await fetch(url, options) : await fetch(url);
  const json = await response.json();
  return {
    success: response.status === 200 ? true : false,
    status: response.status,
    data: json,
  };
};
/*========================================================
# EconomyHandler
========================================================*/
const EconomyHandler = class {
  constructor(options) {
    // ===================================================================
    this.formats = options.setFormat; // thiết lập phân loại tiền tệ các nước
    this.workCooldown = 0; // work, info
    this.maxWallet = 0; // setMaxWalletAmount
    this.maxBank = 0; // setMaxBankAmount, amount, findUser, makeUser
    this.wallet = 0; // makeUser, setDefaultWalletAmount
    this.bank = 0; // makeUser, setDefaultBankAmount
    // ===================================================================
    this.setDefaultWalletAmount(options.setDefaultWalletAmount); // ví tiền
    this.setDefaultBankAmount(options.setDefaultBankAmount); // ngân hàng
    this.setMaxWalletAmount(options.setMaxWalletAmount); // giớ hạn tiền của ví
    this.setMaxBankAmount(options.setMaxBankAmount); // giới hạn gởi tiền ngân hàng
  };
  // ===================================================================
  formatter(money) {
    const c = new Intl.NumberFormat(this.formats[0], {
      style: 'currency',
      currency: this.formats[1],
    });
    return c.format(money);
  };
  // ===================================================================
  setDefaultWalletAmount(amount) {
    if(parseInt(amount)) this.wallet = amount || 0;
  };
  // ===================================================================
  setDefaultBankAmount(amount) {
    if(parseInt(amount)) this.bank = amount || 0;
  };
  // ===================================================================
  setMaxBankAmount(amount) {
    if(parseInt(amount)) this.maxBank = amount || 0;
  };
  // ===================================================================
  setMaxWalletAmount(amount) {
    if(parseInt(amount)) this.maxWallet = amount || 0;
  };
  /*====================================================================
  # Shop and item 
  ====================================================================*/
  async buy(settings) {
    return await this._buy(settings);
  };
  // ===================================================================
  async addUserItem(settings) {
    return await this._buy(settings);
  };
  // ===================================================================
  async addItem(settings) {
    if(!settings.inventory) return {
      error: true,
      type: "No-Inventory",
    };
    if(!settings.inventory.name) return {
      error: true,
      type: "No-Inventory-Name",
    };
    if(!settings.inventory.price) return {
      error: true,
      type: "No-Inventory-Price",
    };
    if (!parseInt(settings.inventory.price)) return {
      error: true,
      type: "Invalid-Inventory-Price",
    };
    const item = {
      name: String(settings.inventory.name) || "Mèo Béo",
      price: parseInt(settings.inventory.price) || 0,
      description: String(settings.inventory.description) || "Không có mô tả",
      itemId: this.makeid(),
    };
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    inv.findOneAndUpdate({ guildID: settings.guild.id || null }, {
      $push: {
        inventory: item,
      },
    }, {
      upsert: true,
      useFindAndModify: false,
    }).catch((e) => {
      if(e) return console.log(e);
    });
    return {
      error: false,
      item: item,
    };
  };
  // ===================================================================
  async removeItem(settings) {
    let inventoryData = await this.getInventory(settings);
    let thing = parseInt(settings.item);
    if(!thing) return {
      error: true,
      type: "Invalid-Item-Number",
    };
    thing = thing - 1;
    if(!inventoryData.inventory[thing]) return {
      error: true,
      type: "Unknown-Item",
    };
    const deletedDB = inventoryData.inventory[thing];
    inventoryData.inventory.splice(thing, 1);
    inventoryData.save();
    return {
      error: false,
      inventory: deletedDB,
    };
  };
  // ===================================================================
  async setItems(settings) {
    if(!settings.shop) return {
      error: true,
      type: "No-Shop",
    };
    if(!Array.isArray(settings.shop)) return {
      error: true,
      type: "Invalid-Shop",
    };
    for (const x of settings.shop) {
      if(!x.name) return {
        error: true,
        type: "Invalid-Shop-name",
      };
      if(!x.price) return {
        error: true,
        type: "Invalid-Shop-price",
      };
      if(!x.description) x.description = "No Description.";
    };
    inv.findOneAndUpdate(
      { guildID: settings.guild.id || null },
      { $set: { inventory: settings.shop }},
      { upsert: true, useFindAndModify: false }
    ).catch((e) => {
        if(e) return console.log(e);
    });
    return {
      error: false,
      type: "success",
    };
  };
  // ===================================================================
  async removeUserItem(settings) {
    let data = await this.findUser(settings, null, null, "removeUserItem");
    let item = null;
    let thing = parseInt(settings.item);
    if(!thing) return {
      error: true,
      type: "Invalid-Item-Number",
    };
    thing = thing - 1;
    if(!data.inventory[thing]) return {
      error: true,
      type: "Unknown-Item",
    };
    let done = false;
    // Lưu thay đổi
    let data_user = {};
    let data_error = {
      error: true,
      type: "Invalid-Item-Number",
    };
    // Nếu người dùng muốn xóa tất cả các mục
    if(settings.amount == "all") {
      // Tìm chỉ mục của mặt hàng
      let i = data.inventory.findIndex((i) => i === data.inventory.filter((inv) => inv.name === thing)) + 1;
      let data_to_save = {
        count: 0,
        name: data.inventory[i].name,
        deleted: data.inventory[i].amount,
        itemId: data.inventory[i].itemId,
      };
      data_user = data_to_save;
      item = data.inventory[i];
      data.inventory.splice(i, 1);
      done = true;
    } else {
      for (let i in data.inventory) {
        if(data.inventory[i] === data.inventory[thing]) {
          // Nếu trong kho số lượng mặt hàng lớn hơn 1 và không chỉ định số lượng
          if(data.inventory[i].amount > 1 && !settings?.amount) {
            item = data.inventory[i];
            data.inventory[i].amount--;
            let data_to_save = {
              count: data.inventory[i].amount,
              name: data.inventory[i].name,
              deleted: 1,
              itemId: data.inventory[i].itemId,
            };
            data_user = data_to_save;
            done = true;
            // Nếu trong kho số lượng mặt hàng bằng 1 và không chỉ định số lượng
          } else if(data.inventory[i].amount === 1 && !settings?.amount) {
            let data_to_save = {
              count: 0,
              name: data.inventory[i].name,
              deleted: 1,
              itemId: data.inventory[i].itemId,
            };
            data_user = data_to_save;
            item = data.inventory[i];
            data.inventory.splice(i, 1);
            done = true;
            // Nếu số được chỉ định
          } else if(settings?.amount !== "all") {
            // Nếu số được chỉ định lớn hơn số mục trong kho
            if(settings.amount > data.inventory[i].amount) {
              done = false;
              data_error.type = "Invalid-Amount";
            } else if(String(settings.amount).includes("-")) {
              done = false;
              data_error.type = "Negative-Amount";
            } else if(parseInt(settings.amount) === 0) {
              done = false;
              data_error.type = "Invalid-Amount";
            } else {
              item = data.inventory[i];
              data.inventory[i].amount -= settings.amount;
              let data_to_save = {
                count: data.inventory[i].amount,
                name: data.inventory[i].name,
                deleted: settings.amount,
                itemId: data.inventory[i].itemId,
              };
              data_user = data_to_save;
              done = true;
            }
          }
        }
      }
    }
    if(done == false) return data_error;
    cs.findOneAndUpdate({ guildID: settings.guild.id || null, userID: settings.user.id || null }, {
      $set: {
        inventory: data.inventory,
      },
    }, {
      useFindAndModify: false,
      upsert: true
    }).catch((e) => {
      if(e) return console.log(e);
    });
    return {
      error: false,
      inventory: data_user,
      rawData: data,
      item: item,
    };
  };
  // ===================================================================
  async transferItem(settings) {
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let user1 = await this.findUser({ user: settings.user1, guild: settings.guild }, null, null, "transferItem");
    let user2 = await this.findUser({ user: settings.user2, guild: settings.guild }, null, null, "transferItem");
    let name, amount_to_transfer, itemsLeft;
    // mục 
    let thing = parseInt(settings.item);
    if(!thing) return {
      error: true,       
      type: "No-Item",
    };
    thing = thing - 1;
    // kiểm tra nếu mục tồn tại
    if (!user1.inventory[thing]) return { error: true, type: "Invalid-Item" };
    // Số lượng
    amount_to_transfer = settings.amount;
    if(amount_to_transfer === "all" || amount_to_transfer === "max") {
      let user2_has_item = false;
      let ifHasItem_then_index = 0;
      for (let i = 0; i < user1.inventory.length; i++) {
        if(user2.inventory[i].name === user1.inventory[thing].name) {
          user2_has_item = true;
          ifHasItem_then_index = i;
        }
      }
      amount_to_transfer = user1.inventory[thing].amount;
      name = user1.inventory[thing].name;
      itemsLeft = 0;
      if(user2_has_item === false) {
        user2.inventory.push(user1.inventory[thing]);
      } else {
        user2.inventory[ifHasItem_then_index].amount += user1.inventory[thing].amount;
      };
      user1.inventory.splice(thing, 1);
    } else {
      amount_to_transfer = parseInt(amount_to_transfer) || 1;
      if(amount_to_transfer <= 0) return { error: true, type: "Invalid-Amount" };
      if(amount_to_transfer > user1.inventory[thing].amount) return { error: true, type: "In-Sufficient-Amount" };
      let user2_has_item = false;
      let ifHasItem_then_index = 0;
      for (let i = 0; i < user2.inventory.length; i++) {
        if(user2.inventory[i].name === user1.inventory[thing].name) {
          user2_has_item = true;
          ifHasItem_then_index = i;
        }
      }
      name = user1.inventory[thing].name;
      if(user2_has_item === false) {
        user2.inventory.push({
          name: user1.inventory[thing].name,
          amount: amount_to_transfer,
        });
      } else {
        user2.inventory[ifHasItem_then_index].amount += amount_to_transfer;
      };
      user1.inventory[thing].amount -= amount_to_transfer;
      itemsLeft = user1.inventory[thing].amount;
    }
    user1.markModified("inventory");
    user2.markModified("inventory");
    await this.saveUser(user1, user2);
    return {
      error: false,
      type: "success",
      transfered: amount_to_transfer,
      itemName: name,
      itemsLeft: itemsLeft,
    };
  };
  // ===================================================================
  makeid(length = 5) {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
  };
  /*====================================================================
  # global.js 👨‍💻
  ====================================================================*/
  async info(userID, guildID) {
    let data = await this.findUser({}, userID, guildID);
    let lastHourlyy = true, lastHaflyy = true, lastDailyy = true, lastWeeklyy = true, lastMonthlyy = true, lastBeggedy = true, lastQuaterlyy = true, lastWorkk = true, lastYearlyy = true;
    if(data.lastBegged !== null && (data.begTimeout || 240) - (Date.now() - data.lastBegged) / 1000 > 0) lastBeggedy = false;
    if(data.lastHourly !== null && 3600 - (Date.now() - data.lastHourly) / 1000 > 0) lastHourlyy = false;
    if(data.lastDaily !== null && 86400 - (Date.now() - data.lastDaily) / 1000 > 0) lastDailyy = false;
    if(data.lastHafly !== null && 43200 - (Date.now() - data.lastHafly) / 1000 > 0) lastHaflyy = false;
    if(data.lastQuaterly !== null && 12600 - (Date.now() - data.lastQuaterly) / 1000 > 0) lastQuaterlyy = false;
    if(data.lastWeekly !== null && 604800 - (Date.now() - data.lastWeekly) / 1000 > 0) lastWeeklyy = false;
    if(data.lastMonthly !== null && 2.592e6 - (Date.now() - data.lastMonthly) / 1000 > 0) lastMonthlyy = false;
    if(data.lastWork !== null && this.workCooldown - (Date.now() - data.lastWork) / 1000 > 0) lastWorkk = false;
    if(data.lastYearly !== null && (31536000000 - (Date.now() - data.lastYearly)) / 1000 > 0) lastYearlyy = false;
    return {
      error: false,
      rawData: data,
      info: Object.entries({
        Hourly: {
          used: lastHourlyy,
          timeLeft: this.parseSeconds(Math.floor(3600 - (Date.now() - data.lastHourly) / 1000)),
        },
        Hafly: {
          used: lastHaflyy,
          timeLeft: this.parseSeconds(Math.floor(43200 - (Date.now() - data.lastHafly) / 1000)),
        },
        Daily: {
          used: lastDailyy,
          timeLeft: this.parseSeconds(Math.floor(86400 - (Date.now() - data.lastDaily) / 1000)),
        },
        Weekly: {
          used: lastWeeklyy,
          timeLeft: this.parseSeconds(Math.floor(604800 - (Date.now() - data.lastWeekly) / 1000)),
        },
        Monthly: {
          used: lastMonthlyy,
          timeLeft: this.parseSeconds(Math.floor(2.592e6 - (Date.now() - data.lastMonthly) / 1000)),
        },
        Begged: {
          used: lastBeggedy,
          timeLeft: this.parseSeconds(Math.floor((data.begTimeout || 240) - (Date.now() - data.lastBegged) / 1000)),
        },
        Quaterly: {
          used: lastQuaterlyy,
          timeLeft: this.parseSeconds(Math.floor(12600 - (Date.now() - data.lastQuaterly) / 1000)),
        },
        Work: {
          used: lastWorkk,
          timeLeft: this.parseSeconds(Math.floor(12600 - (Date.now() - data.lastWork) / 1000)),
        },
        Yearly: {
          used: lastYearlyy,
          timeLeft: this.parseSeconds(Math.floor((31536000000 - (Date.now() - data.lastYearly)) / 1000)),
        },
      }),
    };
  };
  // ===================================================================
  async work(settings) {
    let data = await this.findUser(settings, null, null);
    const oldData = data;
    let lastWork = data.lastWork;
    let timeout = settings.cooldown;
    workCooldown = timeout;
    if(lastWork !== null && timeout - (Date.now() - lastWork) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: parseSeconds(Math.floor(timeout - (Date.now() - lastWork) / 1000)),
      };
    } else {
      let amountt = Math.floor(Math.random() * settings.maxAmount || 100) + 1;
      data.lastWork = Date.now();
      data = this.amount(data, "add", "wallet", amountt);
      await this.saveUser(data);
      let result = Math.floor(Math.random() * settings.replies.length);
      return {
        error: false,
        type: "success",
        workType: settings.replies[result],
        amount: amountt,
      };
    };
  };
  // ===================================================================  
  parseSeconds(seconds) {
    if(String(seconds).includes("-")) return "0 giây";
    let days = parseInt(seconds / 86400);
    seconds = seconds % 86400;
    let hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);
    if(days) {
      return `${days} ngày, ${hours} giờ, ${minutes} phút`;
    } else if(hours) {
      return `${hours} giờ, ${minutes} phút, ${seconds} giây`;
    } else if(minutes) {
      return `${minutes} phút, ${seconds} giây`;
    };
    return `${seconds} giây`;
  };
  /*====================================================================
  # management.js 👨‍💻👨‍💻
  ====================================================================*/
  async addMoneyToAllUsers(settings) {
    if(String(settings.amount).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    let amountt = parseInt(settings.amount) || 0;
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let data = await cs.find({
      guildID: settings.guild.id || null,
    });
    if(!data) return {
      error: true,
      type: "no-users",
    };

    data.forEach(async(user) => {
      if(settings.wheretoPutMoney === "bank") {
        user = this.amount(user, "add", "bank", amountt);
      } else {
        user = this.amount(user, "add", "wallet", amountt);
      };
    });

    data.forEach((a) => a.save().catch((err) => {
      if(err) return console.log(err);
    }));
    return {
      error: false,
      type: "success",
      rawData: data,
    };
  };
  // ===================================================================
  async removeMoneyFromAllUsers(settings) {
    if(String(settings.amount).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    let amountt = parseInt(settings.amount) || 0;
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let data = await cs.find({ guildID: settings.guild.id || null });
    if(!data) return {
      error: true,
      type: "no-users",
    };

    data.forEach(async(user) => {
      if(settings.wheretoPutMoney === "bank") {
        if(settings.amount === "all" || settings.amount === "max") {
          user.bank = 0;
        } else {
          user = this.amount(user, "remove", "bank", parseInt(settings.amount) || 0);
        };
      } else {
        if(settings.amount === "all" || settings.amount === "max") {
          user.wallet = 0;
        } else {
          user = this.amount(user, "remove", "wallet", parseInt(settings.amount) || 0);
        };
      };
    });
    data.forEach((a) => a.save().catch(function(err) {
      if(err) return console.log(err);
    }));
    return {
      error: false,
      type: "success",
      rawData: data,
    };                                               
  };
  // ===================================================================
  async addMoney(settings) {
    let data = await this.findUser(settings, null, null);
    if(String(settings.amount).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    let amountt = parseInt(settings.amount) || 0;
    if(settings.wheretoPutMoney === "bank") {
      data = this.amount(data, "add", "bank", amountt);
    } else {
      data = this.amount(data, "add", "wallet", amountt);
    };
    await this.saveUser(data);
    return {
      error: false,
      type: "success",
      rawData: data,
    };
  };
  // ===================================================================
  async removeMoney(settings) {
    let data = await this.findUser(settings, null, null);
    const oldData = data;
    if(String(settings.amount).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    if(settings.wheretoPutMoney === "bank") {
      if(settings.amount === "all" || settings.amount === "max") {
        data.bank = 0;
      } else {
        data = this.amount(data, "remove", "bank", parseInt(settings.amount) || 0);
      };
    } else {
      if(settings.amount === "all" || settings.amount === "max") {
        data.wallet = 0;
      } else {
        data = this.amount(data, "remove", "wallet", parseInt(settings.amount) || 0);
      };
    };
    await this.saveUser(data);
    return {
      error: false,
      type: "success",
      rawData: data,
    };
  };
  // ===================================================================
  async findUser(settings, uid, gid, by) {
    if(typeof settings.user === "string") settings.user = {
      id: settings.user,
    };
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let find = await cs.findOne({
      userID: uid || settings.user.id,
      guildID: gid || settings.guild.id || null,
    });
    if(!find) find = await this.makeUser(settings, false, uid, gid);
    if(this.maxBank > 0 && find.bankSpace == 0) find.bankSpace = this.maxBank;
    if(!find.streak) find.streak = {};
    if(!find.streak.hourly) find.streak.hourly = 0;
    if(!find.streak.daily) find.streak.daily = 0;
    if(!find.streak.weekly) find.streak.weekly = 0;
    if(!find.streak.monthly) find.streak.monthly = 0;
    if(!find.streak.yearly) find.streak.yearly = 0;
    if(!find.streak.hafly) find.streak.hafly = 0;
    if(!find.streak.quaterly) find.streak.quaterly = 0;
    return find;
  };
  // ===================================================================  
  async makeUser(settings, user2 = false, uid, gid) {
    if(typeof settings.user === "string") settings.user = {
      id: settings.user,
    };
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let user = uid || settings.user.id;
    if(user2) user = settings.user2.id;
    const newUser = new cs({
      userID: user,
      guildID: gid || settings.guild.id || null,
      wallet: this.wallet || 0,
      bank: this.bank || 0,
      bankSpace: this.maxBank || 0,
      streak: {
        hourly: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        hafly: 0,
        quaterly: 0,
      },
    });
    if(!newUser) return console.log("Thiếu dữ liệu để tìm nạp từ DB. (Một chức năng trong Hệ thống economy được sử dụng và ID người dùng không được cung cấp.)");
    return newUser;
  };
  // ===================================================================  
  async saveUser(data, data2) {
    process.nextTick(async() => {
      await this.sleep(Math.floor(Math.random() * 10 + 1) * 100); // Trình tạo số ngẫu nhiên 100 - 1000
      data.save().then((_) => _ ? "" : console.error(`Lỗi Xảy ra khi lưu dữ liệu (economy Handlers) \n${"=".repeat(50)}\n${_ + "\n" + "=".repeat(50)}`));
      if(data2) data2.save().then((_) => _ ? "" : console.error(`Lỗi Xảy ra khi lưu dữ liệu (economy Handlers) \n${"=".repeat(50)}\n${_ + "\n" + "=".repeat(50)}`));
    }, data, data2 );
  };
  // ===================================================================
  async setBankSpace(userID, guildID, newAmount) {
    let data = await this.findUser({}, userID, guildID);
    newAmount = parseInt(newAmount);
    if(!newAmount && newAmount !== 0) return {
      error: true,
      type: "no-amount-provided",
      rawData: data,
    };
    let oldData = Object.assign({}, data);
    data.bankSpace = newAmount;
    await this.saveUser(data);
    if(oldData.bankSpace !== data.bankSpace) {
      return {
        error: false,
        type: "success",
        amount: data.bankSpace,
        rawData: data,
      };
    } else return {
        error: true,
        type: "same-amount",
        rawData: data,
    };
  };
  // ===================================================================
  async withdraw(settings) {
    let data = await this.findUser(settings, null, null);
    let money = String(settings.amount);
    if(!money) return {
      error: true,
      type: "money",
    };
    if(money.includes("-")) return {
      error: true,
      type: "negative-money",
    };
    if(money === "all" || money === "max") {
      if(data.bank < 1) return {
        error: true,
        type: "no-money",
      };
      data.wallet += data.bank;
      data.bank = 0;
      if(!data.networth) data.networth = 0;
      data.networth = data.bank + data.wallet;
      await this.saveUser(data);
      return {
        error: false,
        rawData: data,
        type: "all-success",
      };
    } else {
      money = parseInt(money);
      if(data.bank < parseInt(money)) return {
        error: true,
        type: "low-money",
      };
      if(isNaN(money)) return {
        error: true,
        type: "money",
      };
      if(money > data.bank) return {
        error: true,
        type: "low-money",
      };
      data.wallet += money;
      data.bank -= money;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: money,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async deposite(settings) {
    let data = await this.findUser(settings, null, null);
    let money = String(settings.amount);
    if(!money) return {
      error: true,
      type: "money",
    };
    if(String(money).includes("-")) return {
      error: true,
      type: "negative-money",
    };
    if(money === "all" || money === "max") {
      if(data.wallet === 0) return {
        error: true,
        type: "no-money",
      };
      if(data.bankSpace > 0 && money === "all" && data.bank === data.bankSpace) return {
        error: true,
        rawData: data,
        type: "bank-full",
      };
      data.bank += data.wallet;
      data.wallet = 0;
      if(data.bankSpace > 0 && data.bank > data.bankSpace) {
        const a = data.bank;
        data.bank = data.bankSpace;
        data.wallet += Math.abs(a - data.bankSpace);
      };
      if(!data.networth) data.networth = 0;
      data.networth = data.bank + data.wallet;
      await this.saveUser(data);
      return {
        error: false,
        rawData: data,
        type: "all-success",
      };
    } else {
      money = parseInt(money);
      if(!money) return {
        error: true,
        type: "money",
      };
      if(money > data.wallet) return {
        error: true,
        type: "low-money",
      };
      if(data.bankSpace > 0 && data.bank == data.bankSpace) return {
        error: true,
        type: "bank-full",
        rawData: data,
      };
      data.bank += money;
      if(data.wallet - money < 0) {
        const a = data.wallet;
        data.wallet = 0;
        data.bank -= Math.abs(a - money);
      };
      data.wallet -= money;
      if(!data.networth) data.networth = 0;
      data.networth = data.bank + data.wallet;
      if(data.bankSpace > 0 && data.bank > data.bankSpace) {
        const a = data.bank;
        data.bank = data.bankSpace;
        data.wallet += Math.abs(a - data.bankSpace);
      };
      await this.saveUser(data);
      return {
        error: false,
        rawData: data,
        type: "success",
        amount: money,
      };
    };
  };
  // ===================================================================
  async transferMoney(settings) {
    if(typeof settings.user === "string") settings.user = {
      id: settings.user,
    };
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let user1 = await this.findUser(settings, null, null);
    const oldData = user1;
    let user2 = await cs.findOne({
      userID: settings.user2.id,
      guildID: settings.guild.id || null,
    });
    if(!user2) user2 = await this.makeUser(settings, true);
    const oldData1 = user2;
    let money = parseInt(settings.amount);
    if(user1.wallet < money) return {
      error: true,
      type: "low-money",
    };
    user1 = this.amount(user1, "remove", "wallet", money);
    user2 = this.amount(user2, "add", "wallet", money);
    await this.saveUser(user1, user2);
    return {
      error: false,
      type: "success",
      money: money,
      user: settings.user,
      user2: settings.user2,
      rawData: user1,
      rawData1: user2,
    };
  };
  // ===================================================================  
  sleep(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  };
  // ===================================================================
  amount(data, type = "add", where = "wallet", amount, by) {
    if(!data.bankSpace) data.bankSpace = this.maxBank || 0;
    if(where === "bank") {
      if(type === "add") data.bank += amount;
      else data.bank -= amount;
    } else {
      if(type === "add") data.wallet += amount;
      else data.wallet -= amount;
    };
    if(data.bankSpace > 0 && data.bank > data.bankSpace) {
      const a = data.bank;
      data.bank = data.bankSpace;
      data.wallet += Math.abs(a - data.bankSpace);
    };
    if(!data.networth) data.networth = 0;
    data.networth = data.bank + data.wallet;
    return data;
  };
  /*====================================================================
  # informative.js 👨‍💻👨‍💻👨‍💻
  ====================================================================*/
  async balance(settings) {
    let data = await this.findUser(settings, null, null);
    if(!data.networth) data.networth = 0;
    data.networth = data.wallet + data.bank;
    return {
      rawData: data,
      bank: data.bank,
      wallet: data.wallet,
      networth: data.networth,
    };
  };
  // ===================================================================
  async leaderboard(guildid) {
    let data = await cs.find({ guildID: guildid || null });
    data.sort((a, b) => {
      return b.networth - a.networth;
    });
    return data;
  };
  // ===================================================================
  async globalLeaderboard() {
    let array = await cs.find();
    var output = [];
    array.forEach(function(item) {
      var existing = output.filter(function (v, i) {
        return v.userID == item.userID;
      });
      if(existing.length) {
        var existingIndex = output.indexOf(existing[0]);
        output[existingIndex].bank = output[existingIndex].bank + item.bank;
        output[existingIndex].wallet = output[existingIndex].wallet + item.wallet;
        output[existingIndex].networth = output[existingIndex].wallet + output[existingIndex].bank;
      } else {
        output.push(item);
      };
    });
    output.sort((a, b) => {
      return b.networth - a.networth;
    });
    return output;
  };
  // ===================================================================
  async getUserItems(settings) {
    let data = await this.findUser(settings, null, null);
    return {
      error: false,
      inventory: data.inventory,
      rawData: data,
    };
  };
  // ===================================================================
  async getShopItems(settings) {
    let data = await this.getInventory(settings);
    return {
      error: false,
      inventory: data.inventory,
      rawData: data,
    };
  };
  // ===================================================================
  async getInventory(settings) {
    if(typeof settings.user === "string") settings.user = {
      id: settings.user,
    };
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let find = await inv.findOne({
      guildID: settings.guild.id || null,
    });
    if(!find) find = await this.makeInventory(settings);
    if(find.inventory.length > 0)
      find.inventory.forEach((a) => {
        if(!a.description) a.description = "Không có mô tả.";
      });
    return find;
  };
  // ===================================================================
  async makeInventory(settings) {
    if(typeof settings.user === "string") settings.user = {
      id: settings.user,
    };
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    const inventory = new inv({ guildID: settings.guild.id || null, inventory: [] });
    return inventory;
  };
  // ===================================================================
  async updateInventory(mongoURL, newData, settings, collection = "inventory-currencies") {
    if(typeof settings.user === "string") settings.user = {
      id: settings.user,
    };
    if(typeof settings.guild === "string") settings.guild = {
      id: settings.guild,
    };
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let query = { guildID: settings.guild.id || null };
    if(settings.user) query = {
      userID: settings.user.id,
      guildID: settings.guild.id || null,
    };
    new (require("mongodb").MongoClient)(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).connect(function (err, db) {
      if(err) return console.log("Không thể kết nối với MongoDB (Chức năng updateInventory)")
      console.log("Đã kết nối với MongoDB (Chức năng updateInventory)");
      db.db(mongoURL.split("/")[mongoURL.split("/").length - 1]).collection(collection).updateOne(query, {
        $set: {
          inventory: newData,
        },
      }, {
        upsert: true,
      }, function(err, res) {
          if(err) return console.log("Không thể lưu dữ liệu vào MongoDB (Chức năng updateInventory)", err)
          if(res.result.n) {
            return console.log("Đã lưu dữ liệu thành công (Chức năng updateInventory)")
          } else {
            console.log("MongoDB không cập nhật DB.  (Chức năng updateInventory)")
            db.close();
          };
      });
    });
  };
  /*====================================================================
  # moneyMaking.js 👨‍💻👨‍💻👨‍💻👨‍💻
  ====================================================================*/
  async monthly(settings) {
    let data = await this.findUser(settings, null, null);
    const oldData = data;
    let monthly = data.lastMonthly;
    let timeout = 2.592e6;
    if(monthly !== null && timeout - (Date.now() - monthly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - monthly) / 1000)),
      };
    } else {
      data.lastMonthly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - monthly) / 1000 > timeout * 2) data.streak.monthly = 0;
      data.streak.monthly += 1;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async yearly(settings) {
    let data = await this.findUser(settings, null, null);
    let yearly = data.lastYearly;
    let timeout = 31536000000;
    if(yearly !== null && (timeout - (Date.now() - yearly)) / 1000 >= 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor((timeout - (Date.now() - yearly)) / 1000)),
      };
    } else {
      data.lastYearly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - yearly) / 1000 > timeout * 2) data.streak.yearly = 0;
      data.streak.yearly += 1;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };                                                                     
  };
  // ===================================================================
  async weekly(settings) {
    let data = await this.findUser(settings, null, null);
    let weekly = data.lastWeekly;
    let timeout = 604800;
    if(weekly !== null && timeout - (Date.now() - weekly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - weekly) / 1000)),
      };
    } else {
      data.lastWeekly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - data.lastWeekly) / 1000 > timeout * 2)
        data.streak.weekly = 0;
      data.streak.weekly += 1;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async quaterly(settings) {
    let data = await this.findUser(settings, null, null);
    let quaterly = data.lastQuaterly;
    let timeout = 21600;
    if(quaterly !== null && timeout - (Date.now() - quaterly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - quaterly) / 1000)),
      };
    } else {
      data.lastQuaterly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - quaterly) / 1000 > timeout * 2) data.streak.quaterly = 0;
      data.streak.quaterly += 1;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async hafly(settings) {
    let data = await this.findUser(settings, null, null);
    let hafly = data.lastHafly;
    let timeout = 43200;
    if(hafly !== null && timeout - (Date.now() - hafly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - hafly) / 1000)),
      };
    } else {
      data.lastHafly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - data.lastHafly) / 1000 > timeout * 2) data.streak.hafly = 0;
      data.streak.hafly += 1;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async daily(settings) {
    let data = await this.findUser(settings, null, null);
    let daily = data.lastDaily;
    let timeout = 86400;
    if(daily !== null && timeout - (Date.now() - daily) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - daily) / 1000)),
      };
    } else {
      data.lastDaily = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - daily) / 1000 > timeout * 2) data.streak.daily = 0;
      data.streak.daily += 1;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    };
  };
  // ===================================================================
  async hourly(settings) {
    let data = await this.findUser(settings, null, null);
    let lastHourly = data.lastHourly;
    let timeout = 3600;
    if(lastHourly !== null && timeout - (Date.now() - lastHourly) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - lastHourly) / 1000)),
      };
    } else {
      data.lastHourly = Date.now();
      data = this.amount(data, "add", "wallet", settings.amount);
      if((Date.now() - lastHourly) / 1000 > timeout * 2) data.streak.hourly = 0;
      data.streak.hourly += 1;
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: settings.amount,
        rawData: data,
      };
    }
  }
  // ===================================================================
  async rob(settings) {
    function testChance(successPercentage) {
      let random = Math.random() * 10;
      return (random -= successPercentage) < 0;
    };
    if(typeof settings.guild === "string") settings.guild.id = settings.guild;
    if(typeof settings.user === "string") settings.user.id = settings.user;
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let user1 = await this.findUser(settings, null, null);
    const oldData = user1;
    let user2 = await cs.findOne({
      userID: settings.user2.id,
      guildID: settings.guild.id || null,
    });
    if(!user2) user2 = await makeUser(settings, true);
    const oldData2 = user2;
    let lastRob = user1.lastRob;
    let timeout = settings.cooldown;
    if(lastRob !== null && timeout - (Date.now() - lastRob) / 1000 > 0) return {
      error: true,
      type: "time",
      time: this.parseSeconds(Math.floor(timeout - (Date.now() - lastRob) / 1000)),
    };
    if(user1.wallet < settings.minAmount - 2) return {
      error: true,
      type: "low-money",
      minAmount: settings.minAmount,
    };
    if(user2.wallet < settings.minAmount - 2) return {
      error: true,
      type: "low-wallet",
      user2: settings.user2,
      minAmount: settings.minAmount,
    };
    let max = settings.maxRob;
    if(!max || max < 1000) max = 1000;
    let random = Math.floor(Math.random() * (Math.floor(max || 1000) - 99)) + 99;
    if(random > user2.wallet) random = user2.wallet;
    user1.lastRob = Date.now();
    // 5 đây là phần trăm thành công.
    if(testChance(settings.successPercentage || 5)) {
    // Thành công!
      user2 = this.amount(user2, "remove", "wallet", random);
      user1 = this.amount(user1, "add", "wallet", random);
      await this.saveUser(user1, user2);
      return {
        error: false,
        type: "success",
        user2: settings.user2,
        minAmount: settings.minAmount,
        amount: random,
      };
    } else {
      // Thất bại :(
      if(random > user1.wallet) random = user1.wallet;
      user2 = this.amount(user2, "add", "wallet", random);
      user1 = this.amount(user1, "remove", "wallet", random);
      await this.saveUser(user1, user2);
      return {
        error: true,
        type: "caught",
        user2: settings.user2,
        minAmount: settings.minAmount,
        amount: random,
      };
    };
  };
  // ===================================================================
  async beg(settings) {
    let data = await this.findUser(settings, null, null);
    const oldData = data;
    let beg = data.lastBegged; 
    let timeout = 240;
    if(parseInt(settings.cooldown)) timeout = parseInt(settings.cooldown);
    if(beg !== null && timeout - (Date.now() - beg) / 1000 > 0) {
      return {
        error: true,
        type: "time",
        time: this.parseSeconds(Math.floor(timeout - (Date.now() - beg) / 1000)),
      };
    } else {
      const amountt = Math.round((settings.minAmount || 200) + Math.random() * (settings.maxAmount || 400));
      data.lastBegged = Date.now();
      data.begTimeout = timeout;
      data = this.amount(data, "add", "wallet", amountt);
      await this.saveUser(data);
      return {
        error: false,
        type: "success",
        amount: amountt,
      };
    };
  };
  // ===================================================================
  async _buy(settings) {
    let inventoryData = await this.getInventory(settings);
    let data = await this.findUser(settings, null, null, "buy");
    if(!settings.guild) settings.guild = {
      id: null,
    };
    let amount_to_add = parseInt(settings.amount) || 1;
    let thing = parseInt(settings.item);
    if(!thing) return {
      error: true,
      type: "No-Item",
    };
    thing = thing - 1;
    if(!inventoryData.inventory[thing]) return {
      error: true,
      type: "Invalid-Item",
    };
    let price = inventoryData.inventory[thing].price;
    if(amount_to_add > 1) price = amount_to_add * inventoryData.inventory[thing].price;
    if(data.wallet < price) return {
      error: true,
      type: "low-money",
    };
    if(amount_to_add <= 0) return { error: true, type: "Invalid-Amount" };
    data.wallet -= price;
    let done = false;
    for (let j in data.inventory) {
      if(inventoryData.inventory[thing].name === data.inventory[j].name) {
        data.inventory[j].amount += amount_to_add || 1;
        if(!data.inventory[j].itemId)
          data.inventory[j].itemId = inventoryData.inventory[thing].itemId || this.makeid();
        done = true;
      }
    }
    if(done == false) {
      data.inventory.push({
        name: inventoryData.inventory[thing].name,
        amount: amount_to_add || 1,
        itemId: inventoryData.inventory[thing].itemId || makeid(),
      });
    }
    cs.findOneAndUpdate(
      {
        guildID: settings.guild.id || null,
        userID: settings.user.id || null,
      },{
        $set: {
          inventory: data.inventory,
          wallet: data.wallet,
        },
      },{
      upsert: true,
      useFindAndModify: false,
    }).catch((e) => {
        if(e) return console.log(e);
    });
    return {
      error: false,
      type: "success",
      inventory: inventoryData.inventory[thing],
      price: price,
      amount: amount_to_add,
    };
  };
};

module.exports = {
  customEvents, onCoolDown, baseURL, MusicRole, musicEmbedDefault, EconomyHandler
};