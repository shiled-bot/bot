const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  memberId: String,
  modId: String,
  reason: String,
  timestamp: {
    type: Number,
    default: Date.now(),
  },
});

const Warning = mongoose.model("warning", schema);

/**
 * create new warning
 * @param {string} guildId
 * @param {schema} warn
 * @returns {Promise<Warning>}
 */
module.exports.createWarn = (guildId, warn) => {
  return new Promise((resolve, reject) => {
    warn.guildId = guildId;
    const warning = new Warning(warn);
    warning
      .save()
      .then((user) => resolve(user))
      .catch((err) => reject(err));
  });
};

/**
 * get a warning by id
 * @param {string} warnId
 * @returns {Promise<Warning>}
 */
module.exports.getWarnById = (warnId) => {
  return new Promise((resolve, reject) => {
    Warning.findOne({ _id: warnId }).then(resolve).catch(reject);
  });
};

/**
 * get warnings for a member or the whole guild or by a moderator
 * @param {string} guildId
 * @param {string?} userId
 * @param {boolean?} isMod - is the id for a moderator
 * @returns {Promise<Warning[]>}
 */
module.exports.getWarnings = (guildId, userId, isMod) => {
  return new Promise((resolve, reject) => {
    let query = { guildId };
    if (userId) query[isMod ? "modId" : "memberId"] = userId;

    Warning.find(query).then(resolve).catch(reject);
  });
};

/**
 * remove a warning by id
 * @param {string} warnId
 * @returns {Promise<mongoose.Query>}
 */
module.exports.removeWarnById = (warnId) => {
  return new Promise((resolve, reject) => {
    Warning.deleteOne({ _id: warnId }).then(resolve).catch(reject);
  });
};

/**
 * remove warnings for a member or the whole guild
 * @param {string} guildId
 * @param {string?} userId
 * @returns {Promise<mongoose.Query>}
 */
module.exports.removeWarnings = (guildId, userId) => {
  return new Promise((resolve, reject) => {
    let query = { guildId };
    if (userId) query.memberId = userId;

    Warning.deleteMany(query).then(resolve).catch(reject);
  });
};
