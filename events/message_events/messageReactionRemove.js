const { Client, MessageReaction, User, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (client, reaction, user) => {
  const { message } = reaction;
  const logging = await getLogging(message.guildId);
  if (
    !logging ||
    !logging.enabled ||
    !logging.messages.enabled ||
    !logging.messages.reactionRemove
  )
    return;

  if (logging.messages.ignoreBots && user.bot) return;

  const channel = await checkLoggingChannel(
    message.guild,
    logging.messages.channel_id,
    "messages"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(user.username)
    .setThumbnail(user.avatarURL({ dynamic: true }))
    .setFooter({
      text: message.guild.name,
      iconURL: message.guild.iconURL(),
    })
    .setDescription(
      `${user.toString()}'s reaction on ${message.author.toString()}'s [message](${
        message.url
      }) removed`
    )
    .addField("Reaction", reaction.emoji.toString())
    .setTimestamp();

  channel.send({ embeds: [embed] });
};
