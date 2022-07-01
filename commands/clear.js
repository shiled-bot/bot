const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction } = require("discord.js");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Deletes a number of messages in text channel. default 50")
    .addIntegerOption((opt) =>
      opt
        .setName("number_of_messages")
        .setDescription("Specify a nubmer of messages to delete. Max 50")
    )
    .addUserOption((opt) =>
      opt
        .setName("filter_by_user")
        .setDescription("Filter messages deletion by user")
    )
    .addRoleOption((opt) =>
      opt
        .setName("filter_by_role")
        .setDescription("Filter messages deletion by role")
    ),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async run(client, interaction) {
    if (!interaction.member.permissions.has("MANAGE_MESSAGES"))
      return interaction.reply({
        content:
          "**You need `Manage Messages` permission to use this command**",
        ephemeral: true,
      });
    if (!interaction.guild.me.permissions.has("MANAGE_MESSAGES"))
      return interaction.reply({
        content:
          "I don't have permissions to delete message. Please check my permissions. 😕",
        ephemeral: true,
      });

    await interaction.deferReply();

    let deleteCount =
      interaction.options.getInteger("number_of_messages") ?? 50;
    if (deleteCount <= 0) deleteCount = 50;
    const filterUserId = interaction.options.getUser("filter_by_user")?.id;
    const filterRoleId = interaction.options.getRole("filter_by_role")?.id;

    let targetMessages = await interaction.channel.messages.fetch({
      limit: deleteCount + 1,
      cache: false,
    });
    const roleFilter = filterRoleId
      ? (msg) => msg.member?.roles.cache.has(filterRoleId)
      : (msg) => msg;
    const userFilter = filterUserId
      ? (msg) => msg.author.id === filterUserId
      : (msg) => msg;

    targetMessages = targetMessages
      .filter((msg) => msg.interaction?.id !== interaction.id)
      .filter(roleFilter)
      .filter(userFilter);

    interaction.channel
      .bulkDelete(targetMessages, true)
      .then(async ({ size }) => {
        const msg = await interaction.editReply(
          "```js\n" +
            `${size} ${size !== 1 ? "Messages" : "Message"}` +
            " Has Been Deleted 🗑️```"
        );
        setTimeout(() => msg.delete(), 3000);
      })
      .catch(console.error);
  },
};
