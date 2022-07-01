const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction } = require("discord.js");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("ban")
    .setDescription("✈️ Bans a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("user to ban").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("The reason of the ban")
    )
    .addIntegerOption((opt) =>
      opt
        .setName("days")
        .setDescription(
          "Number of days of messages to delete, must be between 0 and 7, default 0"
        )
    )
    .addBooleanOption((opt) =>
      opt
        .setName("alert_user")
        .setDescription("Alert user that they have been banned, default true")
    ),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async run(client, interaction) {
    const targetUser = interaction.options.getUser("user", true);
    const targetMember = interaction.options.getMember("user");

    if (!interaction.member.permissions.has("BAN_MEMBERS"))
      return interaction.reply({
        content: "**You need `Ban Members` permission to use this command**",
        ephemeral: true,
      });
    if (!interaction.guild.me.permissions.has("BAN_MEMBERS"))
      return interaction.reply({
        content:
          "I don't have permissions to ban. Please check my permissions. 😕",
        ephemeral: true,
      });
    if (targetUser.id === interaction.user.id)
      return interaction.reply("**You cannot ban yourself !**");
    if (targetUser.id === client.user.id)
      return interaction.reply({
        content: "**I can't ban myself 🤓**",
        ephemeral: true,
      });

    if (
      (targetMember &&
        interaction.member.roles?.highest.position <=
          targetMember.roles?.highest.position &&
        interaction.member.id !== interaction.guild.ownerId) ||
      targetUser.id === interaction.guild.ownerId
    )
      return interaction.reply(`You cannot ban **${targetUser.username}** 👀`);
    if (targetMember && !targetMember.bannable)
      return interaction.reply({
        content: `**I couldn't ban \`${targetUser.username}\`, Please check my role position.**`,
        ephemeral: true,
      });

    await interaction.deferReply();

    try {
      const userBan = await interaction.guild.bans.fetch({
        user: targetUser,
        cache: false,
      });
      if (userBan)
        return interaction.editReply(
          `**${targetUser.username}** is **already banned**\nReason: ${
            userBan.reason ?? "No reason were provided"
          }`
        );
    } catch {}

    const reason =
      interaction.options.getString("reason") ?? "No reason provided";
    const days = interaction.options.getInteger("days") ?? 0;
    const alertUser = interaction.options.getBoolean("alert_user") ?? true;

    try {
      if (alertUser)
        await targetUser.send({
          embeds: [
            {
              title: "You Were Banned",
              description: `Reason \n > ${reason}`,
              color: "#fa1a1a",
              footer: {
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              },
              timestamp: Date.now(),
            },
          ],
        });
    } catch {
    } finally {
      interaction.guild.bans
        .create(targetUser.id, {
          reason: reason,
          days: days < 0 ? 0 : days > 7 ? 7 : days,
        })
        .then(() =>
          interaction.editReply(
            `Banned **${targetUser.username}** from the server <:ban:715159242088120341>\nReason: ${reason}`
          )
        );
    }
  },
};
