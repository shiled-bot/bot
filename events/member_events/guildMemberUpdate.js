const { Client, GuildMember, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = async (client, oldMember, newMember) => {
  const logging = await getLogging(newMember.guild.id);
  if (!logging || !logging.enabled || !logging.members.enabled) return;

  if (logging.members.ignoreBots && newMember.user.bot) return;

  const channel = await checkLoggingChannel(
    newMember.guild,
    logging.members.channel_id,
    "members"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(newMember.displayName)
    .setFooter({
      text: newMember.guild.name,
      iconURL: newMember.guild.iconURL(),
    })
    .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  // Nickname
  if (logging.members.nicknames && oldMember.nickname !== newMember.nickname) {
    embed.setDescription(
      `${newMember.toString()}'s **nickname** has been ${
        newMember.nickname ? "changed" : "removed"
      }.`
    );
    if (oldMember.nickname)
      embed.addField("Old Nickname :", oldMember.nickname);
    if (newMember.nickname)
      embed.addField("New Nickname :", newMember.nickname);
  }

  // Roles
  if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
    if (!logging.members.roleRemoved || !logging.members.roleAdded) return;

    const role = Array.from(
      oldMember.roles.cache.difference(newMember.roles.cache).values()
    )[0];

    embed.setDescription(`✏️ ${newMember.toString()}'s roles has been updated`);
    if (
      logging.members.roleRemoved &&
      oldMember.roles.cache.size > newMember.roles.cache.size
    ) {
      embed.addField("Role Removed : ", "➖ " + role.name);
    } else if (
      logging.members.roles.roleAdded &&
      oldMember.roles.cache.size < newMember.roles.cache.size
    ) {
      embed.addField("Role Added : ", "➕ " + role.name);
    }
  }

  // Guild Avatars
  if (logging.members.avatars && oldMember.avatar !== newMember.avatar) {
    embed.setDescription(
      newMember.avatar
        ? `📸 ${newMember.toString()} changed thier server avatar`
        : `${newMember.toString()} removed thier server avatar`
    );
  }

  channel.send({ embeds: [embed] });
};
