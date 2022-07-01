const {
  Client,
  GuildMember,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
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
    !logging.joinsAndLeaves.joins
  )
    return;

  if (logging.joinsAndLeaves.ignoreBots && member.user.bot) return;

  const channel = await checkLoggingChannel(
    member.guild,
    logging.joinsAndLeaves.channel_id,
    "joinsAndLeaves"
  );
  if (!channel) return;

  const kickBtn = new MessageButton()
    .setLabel("Kick Member")
    .setStyle("SECONDARY")
    .setCustomId(`deleteMember;${member.id};kick`);
  const banBtn = new MessageButton()
    .setLabel("Ban Member")
    .setStyle("DANGER")
    .setCustomId(`deleteMember;${member.id};ban`)
    .setEmoji("🛫");

  const embed = new MessageEmbed()
    .setTitle(member.user.tag)
    .setThumbnail(member.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: member.guild.name,
      iconURL: member.guild.iconURL(),
    })
    .setDescription(`🚶 ${member.toString()} joined the server.`)
    .setTimestamp();

  channel.send({
    embeds: [embed],
    components: [new MessageActionRow({ components: [kickBtn, banBtn] })],
  });
};
