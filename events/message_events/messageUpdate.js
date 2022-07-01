const { Client, Message, MessageEmbed } = require("discord.js");
const { connections } = require("mongoose");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {Message} oldMessage
 * @param {Message} newMessage
 */
module.exports = async (client, oldMessage, newMessage) => {
  const logging = await getLogging(oldMessage.guildId);
  if (
    !logging ||
    !logging.enabled ||
    !logging.messages.enabled ||
    !logging.messages.edited
  )
    return;

  if (logging.messages.ignoreBots && oldMessage.author.bot) return;

  const channel = await checkLoggingChannel(
    oldMessage.guild,
    logging.messages.channel_id,
    "messages"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(oldMessage.member.displayName)
    .setThumbnail(oldMessage.member.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: oldMessage.guild.name,
      iconURL: oldMessage.guild.iconURL(),
    })
    .setDescription(
      `✍️ [Message](${
        oldMessage.url
      }) sent by ${oldMessage.member.toString()} in ${oldMessage.channel.toString()} has been edited`
    )
    .addField(
      "Old Content :",
      "```" + (oldMessage.content || "diff\n - No Content") + "```"
    )
    .addField(
      "New Content :",
      "```" + (newMessage.content || "diff\n - No Content") + "```"
    )
    .setTimestamp();

  channel.send({ embeds: [embed] });
};
