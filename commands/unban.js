const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction } = require("discord.js");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans a user")
    .addStringOption((opt) =>
      opt.setName("user_id").setDescription("User's id").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason of unbanning")
    ),
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async run(client, interaction) {
    if (!interaction.member.permissions.has("BAN_MEMBERS"))
      return interaction.reply({
        content: "**You need `Ban Members` permission to use this command**",
        ephemeral: true,
      });
    if (!interaction.guild.me.permissions.has("BAN_MEMBERS"))
      return interaction.reply({
        content:
          "I don't have permissions to unban. Please check my permissions. 😕",
        ephemeral: true,
      });

    await interaction.deferReply();

    const targetUserId = interaction.options.getString("user_id", true);
    const reason = interaction.options.getString("reason");
    interaction.guild.bans
      .remove(targetUserId, reason)
      .then(async (user) =>
        interaction.editReply(
          `Unbanned **${user.username}** from the server ✅`
        )
      )
      .catch(() =>
        interaction.editReply(
          `couldn't find **${targetUserId}** in the ban list 🔍`
        )
      );
  },
};
