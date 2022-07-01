const { Client, Collection, Message, MessageEmbed } = require("discord.js");
const { getLogging } = require("../../models/logging.model");
const checkLoggingChannel = require("../../utils/checkLoggingChannel");

/**
 * @param {Client} client
 * @param {Collection<Message>} messages
 */
module.exports = async (client, messages) => {
  const last = messages.at(-1);
  const preLast = messages.at(-2);

  const logging = await getLogging(last.guild.id);
  if (
    !logging ||
    !logging.enabled ||
    !logging.messages.enabled ||
    !logging.messages.purged
  )
    return;

  const channel = await checkLoggingChannel(
    last.guild,
    logging.messages.channel_id,
    "messages"
  );
  if (!channel) return;

  let botMessagesSize = 0;
  if (logging.messages.ignoreBot)
    botMessagesSize = messages.filter((msg) => msg.author.bot);

  const embed = new MessageEmbed()
    .setTitle(
      `${
        logging.messages.ignoreBot
          ? `Total: (${messages.size}), Sent by bots: (${botMessagesSize})`
          : `${messages.size} Messages`
      } purged in ${last.channel.toString()}`
    )
    .setThumbnail(last.guild.iconURL())
    .setFooter({ text: last.guild.name, iconURL: last.guild.iconURL() })
    .setDescription(preLast ? "last two messages" : "last message")
    .setTimestamp();

  if (preLast)
    embed.addField(
      `${preLast.member.displayName}${
        preLast.author.bot ? " <:bot:991632338725376065>" : ""
      }`,
      "```" + (preLast.content || "No Content") + "```"
    );
  embed.addField(
    `${last.member.displayName}${
      last.author.bot ? " <:bot:991632338725376065>" : ""
    }`,
    last.content
  );

  channel.send({ embeds: [embed] });
};
