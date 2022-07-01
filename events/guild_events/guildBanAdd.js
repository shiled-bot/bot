const { Client, GuildBan, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {GuildBan} ban
 */
module.exports = async (client, ban) => {
  const logging = await getLogging(ban.guild.id);
  if (
    !logging ||
    !logging.enabled ||
    !logging.server.enabled ||
    !logging.server.bans
  )
    return;

  const channel = await checkLoggingChannel(
    ban.guild,
    logging.server.channel_id,
    "server"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(ban.user.tag)
    .setThumbnail(ban.user.avatarURL({ dynamic: true }))
    .setFooter({ text: ban.guild.name, iconURL: ban.guild.iconURL() })
    .setDescription(`✈️ ${ban.user.toString()} banned from the server.`)
    .setTimestamp();

  channel.send({ embeds: [embed] });
};
