const { Client, Role, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {Role} oldRole
 * @param {Role} newRole
 */
module.exports = async (client, oldRole, newRole) => {
  const logging = await getLogging(newRole.guild.id);
  if (
    !logging ||
    !logging.enabled ||
    !logging.server.enabled ||
    !logging.server.roleUpdate
  )
    return;

  const channel = await checkLoggingChannel(
    newRole.guild,
    logging.server.channel_id,
    "server"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(newRole.guild.name)
    .setFooter({ text: newRole.guild.name, iconURL: newRole.guild.iconURL() })
    .setTimestamp();

  // Name
  if (oldRole.name !== newRole.name) {
    embed
      .setDescription("Role Name Updated")
      .addField("Old Name", oldRole.name, true)
      .addField("New Name", newRole.name, true);
  }

  // Color
  if (oldRole.hexColor !== newRole.hexColor) {
    embed
      .setDescription("Role Color Updated")
      .addField("Old Color", `\`${oldRole.hexColor}\``, true)
      .addField("New Color", `\`${newRole.hexColor}\``, true);
  }

  // Icon
  if (oldRole.icon !== newRole.icon) {
    embed.setDescription("Role Icon Updated");
    if (newRole.icon) embed.setThumbnail(newRole.iconURL());
  }

  // Permissions
  if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
    const displayPermissions = (permissions) =>
      permissions
        .toArray()
        .map((p) => `\`${p}\``)
        .join(", ");

    embed
      .setDescription("Role Permissions Updated")
      .addField("Old Permissions", displayPermissions(oldRole.permissions))
      .addField("New Permissions", displayPermissions(oldRole.permissions));
  }

  embed.addField("Role", newRole.toString());

  channel.send({ embeds: [embed] });
};
