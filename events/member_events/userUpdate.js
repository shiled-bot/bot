const { Client, User, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {User} oldUser
 * @param {User} newUser
 */
module.exports = async (client, oldUser, newUser) => {
  client.guilds.cache
    .filter(async (guild) => {
      try {
        await guild.members.fetch(oldUser.id);

        return true;
      } catch {
        return false;
      }
    })
    .forEach(async (guild) => {
      const logging = await getLogging(guild.id);
      if (!logging || !logging.enabled || !logging.members.enabled) return;

      if (logging.members.ignoreBots && newUser.bot) return;

      const channel = await checkLoggingChannel(
        guild,
        logging.members.channel_id,
        "members"
      );
      if (!channel) return;

      const embed = new MessageEmbed()
        .setTitle(newUser.username)
        .setFooter({
          text: guild.name,
          iconURL: guild.iconURL(),
        })
        .setThumbnail(newUser.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      // Usernames
      if (logging.members.usernames && oldUser.username !== newUser.username) {
        embed
          .setDescription(
            `${newUser.toString()}'s **username** has been changed.`
          )
          .addField("Old Username :", oldUser.username)
          .addField("New Username :", newUser.username);
      }

      // Avatars
      if (logging.members.avatars && oldUser.avatar !== newUser.avatar) {
        embed.setDescription(
          newUser.avatar
            ? `📸 ${newUser.toString()} changed thier avatar`
            : `${newUser.toString()} removed thier avatar`
        );
      }
    });
};
