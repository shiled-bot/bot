const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
const { Client, CommandInteraction } = require("discord.js");
const {
  BOT_INVITE_LINK,
  BOT_SUPPORT_SERVER_INVITE_LINK,
  BOT_WEBSITE_URL,
} = require("../config.json");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("help")
    .setDescription("Feeling lost? ❓"),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run(client, interaction) {
    const messageActionRow = new MessageActionRow();

    if (BOT_INVITE_LINK)
      messageActionRow.addComponents(
        new MessageButton({
          label: "Add To Your Server",
          style: "LINK",
          url: BOT_INVITE_LINK,
        })
      );
    if (BOT_WEBSITE_URL)
      messageActionRow.addComponents(
        new MessageButton({
          label: "Website",
          style: "LINK",
          url: BOT_WEBSITE_URL,
        })
      );

    interaction.reply({
      content: `Commands list at ${BOT_WEBSITE_URL}/commands\nLooking for support? ${BOT_SUPPORT_SERVER_INVITE_LINK}`,
      components:
        messageActionRow.components.length > 0 ? [messageActionRow] : null,
      ephemeral: true,
    });
  },
};
