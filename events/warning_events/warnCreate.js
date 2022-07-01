const {
  Client,
  Guild,
  User,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {object} warning
 * @param {string} warning.id
 * @param {User} warning.user
 * @param {Guild} warning.guild
 * @param {string} warning.modId
 * @param {string} warning.reason
 */
module.exports = async (client, warning) => {
  const logging = await getLogging(warning.guild.id);
  if (!logging || !logging.enabled || !logging.warnings.enabled) return;

  const channel = await checkLoggingChannel(
    warning.guild,
    logging.warnings.channel_id,
    "warnings"
  );
  if (!channel) return;

  const button = new MessageButton()
    .setLabel("Revoke")
    .setStyle("SUCCESS")
    .setCustomId(`deleteWarn;${warning.id}`)
    .setEmoji("🧑‍⚖️");

  const embed = new MessageEmbed()
    .setTitle(warning.user.username)
    .setThumbnail(warning.user.avatarURL({ dynamic: true }))
    .setFooter({ text: warning.guild.name, iconURL: warning.guild.iconURL() })
    .setDescription(
      `<@${warning.modId}> warned ${warning.user.toString()}
      warn id: \`${warning.id}\``
    )
    .addField("Reason :", "```" + warning.reason + "```")
    .setTimestamp();

  channel.send({
    embeds: [embed],
    components: [new MessageActionRow({ components: [button] })],
  });
};
