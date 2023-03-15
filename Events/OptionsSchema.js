const { Schema, model, Mixed, SchemaTypes } = require("mongoose");
/*------------------------
# User Schema
------------------------*/
const User = new Schema({
  _id: String, username: String,
  discriminator: String, logged: Boolean,
});
/*------------------------
# Ticket Schema 
------------------------*/
const Ticket = new Schema({
  _id: String,
  data: {
    name: String,
    region: String,
    owner: { type: String, ref: "users" },
    joinedAt: Date,
    leftAt: Date,
    bots: { type: Number, default: 0 },
  },
  ticket: {
    log_channel: String,
    limit: { type: Number, default: 10 },
    categories: [{
        _id: false,
        name: String,
        staff_roles: [String],
    }],
  },
});
/*------------------------
# Prefix Schema
------------------------*/
const CreatePrefix = Schema({
    guild: String, prefix: String,
});
/*------------------------
# VoiceDB
------------------------*/
const voiceStateUpdate = Schema({
    GuildID: String, ChannelID: String
});
/*------------------------
# GiveawayDB Schema
------------------------*/
const DjRoles1 = new Schema({
    Guild : { type: String, required: true },
    Roles : { type: Array, default: null }, 
    Mode: { type: Boolean, default: false },
});
/*------------------------
# Levels Schema
------------------------*/
const LevelSchema1 = new Schema({
  userID: { type: String  },
  guildID: { type: String },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: new Date()}
});
/*------------------------
# Giveaways Events
------------------------*/
const Giveaways = new Schema({
    messageId: String, channelId: String, guildId: String, startAt: Number,
    endAt: Number, ended: Boolean, winnerCount: Number, prize: String,
    messages: {
      giveaway: String, giveawayEnded: String, inviteToParticipate: String,
      drawing: String, dropMessage: String, winMessage: Mixed, embedFooter: Mixed,
      noWinner: String, winners: String, endedAt: String, hostedBy: String,
    },
    thumbnail: String, hostedBy: String, winnerIds: { type: [String], default: undefined },
    reaction: Mixed, botsCanWin: Boolean, embedColor: Mixed, embedColorEnd: Mixed,
    exemptPermissions: { type: [], default: undefined }, exemptMembers: String, bonusEntries: String, 
    extraData: Mixed,
    lastChance: {
      enabled: Boolean, content: String,
      threshold: Number, embedColor: Mixed,
    },
    pauseOptions: {
      isPaused: Boolean, content: String,
      unPauseAfter: Number, embedColor: Mixed, durationAfterPause: Number,
    },
    isDrop: Boolean,
    allowedMentions: {
      parse: { type: [String], default: undefined },
      users: { type: [String], default: undefined },
      roles: { type: [String], default: undefined },
    },
  },{
    id: false, autoIndex: false,
});
/*------------------------
# welcome goodbye
------------------------*/
const configSchema1 = new Schema({
    guildId: { type: SchemaTypes.String, required: true, unique: true },
    welcomeChannel: { type: SchemaTypes.String, required: false, },
    leaveChannel: { type: SchemaTypes.String, required: false, }
});
module.exports = {
  GiveawaysDB: model('Giveaways', Giveaways),
  LevelSchema: model('Levels', LevelSchema1),
  DjRoles: model('djRoles', DjRoles1),
  GPrefix: model('Prefix', CreatePrefix),
  voiceDT: model("VoiceSystem", voiceStateUpdate),
  Model: model("guild", Ticket),
  Users: model("user", User),
  configSchema: model('guildConfig', configSchema1),
};