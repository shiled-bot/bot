const {
  Client,
  Collection,
  MessageReaction,
  User,
  MessageEmbed,
} = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {User} message
 * @param {Collection<MessageReaction>} reactions
 */
module.exports = async (client, message, reactions) => {
  const logging = await getLogging(message.guildId);
  if (
    !logging ||
    !logging.enabled ||
    !logging.messages.enabled ||
    !logging.messages.reactionPurged
  )
    return;

  const channel = await checkLoggingChannel(
    message.guild,
    logging.messages.channel_id,
    "messages"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(`${reactions.size} rections removed`)
    .setThumbnail(message.guild.iconURL())
    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
    .setDescription(
      `All ${message.author.toString()}'s [message](${
        message.url
      }) reactions removed`
    )
    .setTimestamp();

  channel.send({ embeds: [embed] });
};
