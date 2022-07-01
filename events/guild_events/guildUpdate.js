const { Client, Guild, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {Guild} oldGuild
 * @param {Guild} newGuild
 */
module.exports = async (client, oldGuild, newGuild) => {
  const logging = await getLogging(newGuild.id);
  if (
    !logging ||
    !logging.enabled ||
    !logging.server.enabled ||
    !logging.server.guildUpdate
  )
    return;

  const channel = await checkLoggingChannel(
    newGuild,
    logging.server.channel_id,
    "server"
  );
  if (!channel) return;

  const embed = new MessageEmbed()
    .setTitle(newGuild.name)
    .setFooter({ text: newGuild.name, iconURL: newGuild.iconURL() })
    .setThumbnail(newGuild.iconURL())
    .setTimestamp();

  // Name
  if (oldGuild.name !== newGuild.name) {
    embed
      .setDescription("Server Name Updated")
      .addField("Old Name", oldGuild.name, true)
      .addField("New Name", newGuild.name, true);
  }

  // Icon
  if (oldGuild.icon !== newGuild.icon) {
    embed.setDescription("📸 Guild Icon Updated");
  }

  // Banner
  if (oldGuild.icon !== newGuild.icon) {
    embed
      .setDescription("🖌️ Guild Banner Updated")
      .setImage(newGuild.bannerURL());
  }

  channel.send({ embeds: [embed] });
};
