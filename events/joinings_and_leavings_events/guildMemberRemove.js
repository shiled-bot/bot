const { Client, GuildMember, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
  const logging = await getLogging(member.guild.id);
  if (
    !logging ||
    !logging.enabled ||
    !logging.joinsAndLeaves.enabled ||
    !logging.joinsAndLeaves.leaves
  )
    return;

  if (logging.joinsAndLeaves.ignoreBots && member.user.bot) return;

  const channel = await checkLoggingChannel(
    member.guild,
    logging.joinsAndLeaves.channel_id,
    "joinsAndLeaves"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(member.user.tag)
    .setThumbnail(member.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: member.guild.name,
      iconURL: member.guild.iconURL(),
    })
    .setDescription(`${member.toString()} left.`)
    .setTimestamp();

  channel.send({ embeds: [embed] });
};
