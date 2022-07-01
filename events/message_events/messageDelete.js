const { Client, Message, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  const logging = await getLogging(warning.guild.id);
  if (
    !logging ||
    !logging.enabled ||
    !logging.messages.enabled ||
    !logging.messages.deleted
  )
    return;

  if (logging.messages.ignoreBots && message.author.bot) return;

  const channel = await checkLoggingChannel(
    message.guild,
    logging.messages.channel_id,
    "messages"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(message.member.displayName)
    .setThumbnail(message.member.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
    .setDescription(
      `🗑️ Message sent by ${message.member.toString()} deleted in ${message.channel.toString()}`
    )
    .setTimestamp();

  if (message.content) embed.addField("Content :", message.content);

  channel.send({ embeds: [embed] });
};
