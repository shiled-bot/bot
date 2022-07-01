const { Client, GuildChannel, DMChannel, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {GuildChannel | DMChannel} channel
 */
module.exports = async (client, channel) => {
  if (channel.type === "DM") return;

  const logging = await getLogging(channel.guildId);
  if (
    !logging ||
    !logging.enabled ||
    !logging.server.enabled ||
    !logging.server.channelDelete
  )
    return;

  const channel = await checkLoggingChannel(
    channel.guild,
    logging.server.channel_id,
    "server"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(channel.guild.name)
    .setDescription("**🏘️ Channel Deleted**")
    .addField("Channel Name", `\`${channel.name}\``, true)
    .addField("Type", `\`${channel.type}\``, true)
    .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL() })
    .setTimestamp();
  if (channel.topic) embed.addField("Topic", channel.topic);

  logChannel.send({ embeds: [embed] });
};
