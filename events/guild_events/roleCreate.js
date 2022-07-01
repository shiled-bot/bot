const {
  Client,
  Role,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {Role} role
 */
module.exports = async (client, role) => {
  const logging = await getLogging(role.guild.id);
  if (
    !logging ||
    !logging.enabled ||
    !logging.server.enabled ||
    !logging.server.roleCreate
  )
    return;

  const channel = await checkLoggingChannel(
    role.guild,
    logging.server.channel_id,
    "server"
  );
  if (!channel) return;

  const button = new MessageButton()
    .setLabel("Delete Role")
    .setStyle("SECONDARY")
    .setCustomId(`deleteRole;${role.id}`)
    .setEmoji("❌");

  const embed = new MessageEmbed()
    .setTitle(role.guild.name)
    .setDescription(`**Role Created :**`, role.toString())
    .setFooter({ text: role.guild.name, iconURL: role.guild.iconURL() })
    .setTimestamp();
  if (role.icon) embed.setThumbnail(role.iconURL());

  channel.send({
    embeds: [embed],
    components: [new MessageActionRow({ components: [button] })],
  });
};
