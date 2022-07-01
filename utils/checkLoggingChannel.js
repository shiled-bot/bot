const { Guild, TextChannel } = require("discord.js");
const { disableCategoryLogging } = require("../models/logging.model");

/**
 * check if a logging channel exists and disable category logging if not exist
 * @param {Guild} guild
 * @param {string} channelId
 * @param {string} category - logging category
 * @returns {Promise<TextChannel | null>}
 */
module.exports = (guild, channelId, category) => {
  return new Promise((reslove) => {
    if (!channelId) return reslove(null);

    guild.channels
      .fetch(channelId)
      .then(async (channel) => {
        if (!channel || !channel.type === "GUILD_TEXT") {
          await disableCategoryLogging(guild.id, category, true);
          reslove(null);
        } else reslove(channel);
      })
      .catch(async (err) => {
        await disableCategoryLogging(guild.id, category, true);
        reslove(null);
      });
  });
};
