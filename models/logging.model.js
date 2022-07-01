const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  enabled: {
    type: Boolean,
    default: false,
  },
  members: {
    enabled: {
      type: Boolean,
      default: false,
    },
    ignoreBots: {
      type: Boolean,
      default: true,
    },
    channelId: {
      type: String,
      default: null,
    },
    nicknames: {
      type: Boolean,
      default: true,
    },
    roleAdd: {
      type: Boolean,
      default: true,
    },
    roleRemove: {
      type: Boolean,
      default: true,
    },
    avatars: {
      type: Boolean,
      default: true,
    },
  },
  joinsAndLeaves: {
    enabled: {
      type: Boolean,
      default: false,
    },
    ignoreBots: {
      type: Boolean,
      default: true,
    },
    channelId: {
      type: String,
      default: null,
    },
    joins: {
      type: Boolean,
      default: true,
    },
    leaves: {
      type: Boolean,
      default: true,
    },
  },
  messages: {
    enabled: {
      type: Boolean,
      default: false,
    },
    ignoreBots: {
      type: Boolean,
      default: false,
    },
    channelId: {
      type: String,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: true,
    },
    purged: {
      type: Boolean,
      default: true,
    },
    edited: {
      type: Boolean,
      default: true,
    },
    reactionAdd: {
      type: Boolean,
      default: false,
    },
    reactionRemove: {
      type: Boolean,
      default: false,
    },
    reactionPurged: {
      type: Boolean,
      default: false,
    },
  },
  server: {
    enabled: {
      type: Boolean,
      default: true,
    },
    channelId: {
      type: String,
      default: null,
    },
    ignoreBots: {
      type: Boolean,
      default: false,
    },
    channelCreate: {
      type: Boolean,
      default: true,
    },
    channelDelete: {
      type: Boolean,
      default: true,
    },
    channelUpdate: {
      type: Boolean,
      default: true,
    },
    roleCreate: {
      type: Boolean,
      default: true,
    },
    roleDelete: {
      type: Boolean,
      default: true,
    },
    roleUpdate: {
      type: Boolean,
      default: true,
    },
    guildUpdate: {
      type: Boolean,
      default: true,
    },
    bans: {
      type: Boolean,
      default: true,
    },
    unbans: {
      type: Boolean,
      default: true,
    },
  },
  warnings: {
    enabled: {
      type: Boolean,
      default: false,
    },
    channelId: {
      type: String,
      default: null,
    },
  },
});

const Logging = mongoose.model("logging", schema);

/**
 * get a guild logging
 * @param {string} guildId
 * @returns {Promise<Logging>}
 */
module.exports.getLogging = (guildId) => {
  return new Promise((resolve, reject) => {
    Logging.findOne({ guildId }).then(resolve).catch(reject);
  });
};

/**
 * disable a category logging
 * @param {string} guildId
 * @param {string} category - category to disable
 * @param {boolean} removeChannel - reset category logging channel
 * @returns {Promise<mongoose.Query}
 */
module.exports.disableCategoryLogging = (
  guildId,
  category,
  removeChannel = false
) => {
  return new Promise((reslove, reject) => {
    let updates = {};
    updates[`${category}.enabled`] = false;
    if (removeChannel) updates[`${category}.channelId`] = null;

    Logging.updateOne({ guildId }, updates).then(reslove).catch(reject);
  });
};
