const {
  Client,
  GuildChannel,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {GuildChannel} channel
 */
module.exports = async (client, channel) => {
  const logging = await getLogging(channel.guildId);
  if (
    !logging ||
    !logging.enabled ||
    !logging.server.enabled ||
    !logging.server.channelCreate
  )
    return;

  const channel = await checkLoggingChannel(
    channel.guild,
    logging.server.channel_id,
    "server"
  );
  if (!channel) return;

  const button = new MessageButton()
    .setLabel("Delete Channel")
    .setStyle("SECONDARY")
    .setCustomId(`deleteChannel;${channel.id}`)
    .setEmoji("❌");

  const embed = new MessageEmbed()
    .setTitle(channel.guild.name)
    .setDescription("**🏘️ Channel Created**")
    .addField("Channel", channel.toString(), true)
    .addField("Type", `\`${channel.type}\``, true)
    .setFooter({
      text: channel.guild.name,
      iconURL: channel.guild.iconURL(),
    })
    .setTimestamp();

  channel.send({
    embeds: [embed],
    components: [new MessageActionRow({ components: [button] })],
  });
};
