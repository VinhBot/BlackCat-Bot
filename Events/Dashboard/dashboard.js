const { PermissionsBitField, ChannelType } = require("discord.js");
const Strategy = require("passport-discord").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const express = require("express");
const http = require("node:http");  
const path = require("node:path");
const url = require("node:url");
const fs = require("node:fs");
const ejs = require("ejs");
const MemoryStore = require("memorystore")(session);
const { Database } = require("st.db");
const httpApp = express();
const app = express();
const database = new Database("./Events/Json/defaultDatabase.json", { 
  databaseInObject: true
});
const BotFilters = require("./filters.json");
const settings = require("./config.json");

module.exports = (client) => {
    client.categories = fs.readdirSync(`./Commands/PrefixCommands/`);
    // - Khởi tạo thiết lập đăng nhập Discord!
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    passport.use(new Strategy({
      clientID: settings.config.clientID,
      clientSecret: settings.config.secret,
      callbackURL: settings.config.callback,      
      scope: [`identify`, `guilds`, `guilds.join`]
    }, (accessToken, refreshToken, profile, done) => { 
      process.nextTick(() => done(null, profile));
    }));
    // - THÊM TIẾT KIỆM PHIÊN
    app.use(session({
        store: new MemoryStore({ checkPeriod: 86400000 }),
        secret: `#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n`,
        resave: false,
        saveUninitialized: false,
    }));
    // khởi tạo phần mềm trung gian hộ chiếu.
    app.use(passport.initialize());
    app.use(passport.session());
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, './views'))
    // Những cái cho app.use(s) là đầu vào của phương thức post (cập nhật cài đặt)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    //TẢI TÀI SẢN
    app.use(express.static(path.join(__dirname, './public')));
    //Load .well-known (if available)
    app.use(express.static(path.join(__dirname, '/'), {
      dotfiles: 'allow'
    }));
    // Chúng tôi khai báo một phần mềm trung gian chức năng checkAuth để kiểm tra xem người dùng đã đăng nhập hay chưa và nếu không thì chuyển hướng anh ta.
    const checkAuth = (req, res, next) => {
      if (req.isAuthenticated()) return next();
      req.session.backURL = req.url;
      res.redirect("/login");
    };
    //Login endpoint
    app.get(`/login`, (req, res, next) => {
        if (req.session.backURL) {
          req.session.backURL = req.session.backURL; 
        } else if (req.headers.referer) {
          const parsed = url.parse(req.headers.referer);
          if (parsed.hostname === app.locals.domain) {
            req.session.backURL = parsed.path;
          };
        } else {
          req.session.backURL = `/`;
        };
        next();
    }, passport.authenticate(`discord`, { prompt: `none` }));
    // Điểm cuối gọi lại cho dữ liệu đăng nhập
    app.get(`/callback`, passport.authenticate(`discord`, { failureRedirect: "/" }), async (req, res) => {
        let banned = false; // req.user.id
        if(banned) {
          req.session.destroy(() => {
            res.json({ login: false, message: `Bạn đã bị chặn khỏi Trang tổng quan.`, logout: true })
            req.logout();
          });
        } else {
            res.redirect(`/dashboard`)
        };
    });
    // Khi trang web được tải trên trang chính, hãy hiển thị trang chính + với các biến đó
    app.get("/", (req, res) => {
        res.render("index", {
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          botClient: client,
          Permissions: PermissionsBitField,
          bot: settings.website,
          callback: settings.config.callback,
          categories: client.categories, 
          commands: client.commands, 
          BotFilters: BotFilters
        });
    });
    // Khi trang lệnh được tải, hiển thị nó với các cài đặt đó
    app.get("/commands", (req, res) => {
      res.render("commands", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        botClient: client,
        Permissions: PermissionsBitField,
        bot: settings.website,
        callback: settings.config.callback,
        categories: client.categories, 
        commands: client.commands, 
        BotFilters: BotFilters,
      });
    });
    // Đăng xuất người dùng và chuyển anh ta trở lại trang chính
    app.get(`/logout`, function (req, res) {
      req.session.destroy(() => {
        req.logout();
        res.redirect(`/`);
      });
    });
    // Dashboard endpoint.
    app.get("/dashboard", checkAuth, async (req,res) => {
      if(!req.isAuthenticated() || !req.user) 
      return res.redirect("/?error=" + encodeURIComponent("Hãy đăng nhập đầu tiên!"));
      if(!req.user.guilds)
      return res.redirect("/?error=" + encodeURIComponent("Không thể có được guilds của bạn!"));
        res.render("dashboard", {
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          botClient: client,
          Permissions: PermissionsBitField,
          bot: settings.website,
          callback: settings.config.callback,
          categories: client.categories, 
          commands: client.commands, 
          BotFilters: BotFilters,
        });
    });
    // Settings endpoint.
    app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
      // Chúng tôi xác thực yêu cầu, kiểm tra xem guilds có tồn tại không, thành viên có ở trong guilds không và nếu thành viên có quyền tối thiểu, nếu không, chúng tôi sẽ chuyển hướng lại.
      const guild = client.guilds.cache.get(req.params.guildID);
      if (!guild) return res.redirect("/dashboard?error=" + encodeURIComponent("Không thể lấy dữ liệu thông tin guilds"));
      let member = guild.members.cache.get(req.user.id);
      if (!member) {
        try {
          member = await guild.members.fetch(req.user.id);
        } catch(err) {
          console.error(`Không thể tìm nạp ${req.user.id} trong ${guild.name}: ${err}`);
        };
      };
      if (!member) return res.redirect("/dashboard?error=" + encodeURIComponent("Không thể tìm nạp bạn, xin lỗi!"));
      if (!member.permissions.has("ManageGuild")) {
        return res.redirect("/dashboard?error=" + encodeURIComponent("Bạn không được phép làm điều đó!"));
      };
      let guildData = await database.get(guild.id);
      res.render("settings", {
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: client.guilds.cache.get(req.params.guildID),
          botClient: client,
          guildData: guildData.setDefaultMusicData,
          guildData2: guildData,
          ChannelType: ChannelType,
          Permissions: PermissionsBitField,
          bot: settings.website,
          callback: settings.config.callback,
          categories: client.categories, 
          commands: client.commands, 
          BotFilters: BotFilters,
      });
      await database.set(guild.id, guildData);
    });
    // Settings endpoint.
    app.post("/dashboard/:guildID", checkAuth, async(req, res) => {
      // Chúng tôi xác thực yêu cầu, kiểm tra xem guilds có tồn tại không, thành viên có ở trong guilds không và nếu thành viên có quyền tối thiểu, nếu không, chúng tôi chuyển hướng lại.
      const guild = client.guilds.cache.get(req.params.guildID);
      if (!guild) return res.redirect("/dashboard?error=" + encodeURIComponent("Không thể lấy dữ liệu thông tin Guilds!"));
      let member = guild.members.cache.get(req.user.id);
      if (!member) {
        try {
          member = await guild.members.fetch(req.user.id);
        } catch (err) {
          console.error(`Không thể tìm nạp ${req.user.id} trong ${guild.name}: ${err}`);
        };
      };
      if (!member) return res.redirect("/dashboard?error=" + encodeURIComponent("Không thể Tìm Thông tin Dữ liệu về bạn!"));
      if (!member.permissions.has("ManageGuild")) {
        return res.redirect("/dashboard?error=" + encodeURIComponent("Bạn không được phép làm điều đó!"));
      };
      let guildData = await database.get(guild.id);
      if(req.body.prefix) {
        guildData.setupPrefix = String(req.body.prefix).split(" ")[0];
        await database.set(guild.id, guildData);
      };
      if(req.body.defaultvolume) {
        guildData.setDefaultMusicData.setDefaultVolume = Number(req.body.defaultvolume);
        await database.set(guild.id, guildData);
      };
      if(req.body.defaultautoplay) {
        guildData.setDefaultMusicData.setDefaultAutoplay = true;
        await database.set(guild.id, guildData);
      } else {
        guildData.setDefaultMusicData.setDefaultAutoplay = false;
        await database.set(guild.id, guildData);
      };
      if(req.body.defaultfilters) {
        guildData.setDefaultMusicData.setDefaultFilters = req.body.defaultfilters;
        await database.set(guild.id, guildData);
      };
      if(req.body.djroles) {
        guildData.setDefaultMusicData.setupDjroles = req.body.djroles;
        await database.set(guild.id, guildData);
      };
      if(req.body.botchannel) {
        guildData.setDefaultMusicData.setupChannelId = req.body.botchannel;
        await database.set(guild.id, guildData);
      };
      res.render("settings", {
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: client.guilds.cache.get(req.params.guildID),
          botClient: client,
          guildData: guildData.setDefaultMusicData,
          guildData2: guildData,
          ChannelType: ChannelType,
          Permissions: PermissionsBitField,
          bot: settings.website,
          callback: settings.config.callback,
          categories: client.categories, 
          commands: client.commands, 
          BotFilters: BotFilters,
        });
        await database.set(guild.id, guildData);
    });
    // Queue Dash
    app.get("/queue/:guildID", async (req,res) => {
      res.render("queue", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: client.guilds.cache.get(req.params.guildID),
        botClient: client,
        Permissions: PermissionsBitField,
        bot: settings.website,
        callback: settings.config.callback,
        categories: client.categories, 
        commands: client.commands, 
        BotFilters: BotFilters
      });
    })
    //Queue Dashes
    app.get("/queuedashboard", checkAuth, async (req,res) => {
      if(!req.isAuthenticated() || !req.user) 
      return res.redirect("/?error=" + encodeURIComponent("Vui lòng đăng nhập!"));
      if(!req.user.guilds)
      return res.redirect("/?error=" + encodeURIComponent("Không thể có được guilds của bạn!"));
      res.render("queuedashboard", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        botClient: client,
        Permissions: PermissionsBitField,
        bot: settings.website,
        callback: settings.config.callback,
        categories: client.categories, 
        commands: client.commands, 
        BotFilters: BotFilters
      });
    });
    
    const http = require(`http`).createServer(app);
    http.listen(settings.config.http.port, () => {
        console.log(`HTTP-Website đang chạy trên cổng ${settings.config.http.port}.`.red);
    });
};