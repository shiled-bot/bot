const { Client, GuildChannel, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {GuildChannel} oldChannel
 * @param {GuildChannel} newChannel
 */
module.exports = async (client, oldChannel, newChannel) => {
  const logging = await getLogging(newChannel.guildId);
  if (
    !logging ||
    !logging.enabled ||
    !logging.server.enabled ||
    !logging.server.channelUpdate
  )
    return;

  const logChannel = await checkLoggingChannel(
    newChannel.guild,
    logging.server.channel_id,
    "server"
  );
  if (!logChannel) return;

  let embed = new MessageEmbed()
    .setTitle(newChannel.name)
    .setFooter({
      text: newChannel.guild.name,
      iconURL: newChannel.guild.iconURL(),
    })
    .setTimestamp();

  // Name
  if (oldChannel.name !== newChannel.name) {
    embed
      .setDescription("Channel Name Updated")
      .addField("Old Name", `\`${oldChannel.name}\``, true)
      .addField("New Name", `\`${newChannel.name}\``, true);
  }

  // Topic
  if (oldChannel.topic !== newChannel.topic) {
    embed.setDescription("Channel Topic Changed");

    if (oldChannel.topic && !newChannel.topic)
      embed.setDescription("Channel Topic Deleted");
    if (!oldChannel.topic && newChannel.topic)
      embed.setDescription("New Channel Topic");

    if (oldChannel.topic)
      embed.addField("Old Topic", `\`${oldChannel.topic}\``, true);
    if (newChannel.topic)
      embed.addField("New Topic", `\`${newChannel.topic}\``, true);
  }

  embed.addField("Channel", newChannel.toString());

  logChannel.send({ embeds: [embed] });
};
