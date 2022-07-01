const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction } = require("discord.js");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a member")
    .addUserOption((opt) =>
      opt.setName("member").setDescription("member to kick").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("reason")
        .setDescription("The reason of the kick")
        .setRequired(false)
    )
    .addBooleanOption((opt) =>
      opt
        .setName("alert_member")
        .setDescription(
          "Alert member that they have been kicked, default false"
        )
    ),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async run(client, interaction) {
    const targetMember = interaction.options.getMember("member");

    if (!interaction.member.permissions.has("KICK_MEMBERS"))
      return interaction.reply({
        content: "**You need `Kick Members` permission to use this command**",
        ephemeral: true,
      });
    if (!targetMember)
      return interaction.reply(
        `${interaction.options.getUser("member").username} is not a member !`
      );
    if (!interaction.guild.me.permissions.has("KICK_MEMBERS"))
      return interaction.reply({
        content:
          "I don't have permissions to kick. Please check my permissions. 😕",
        ephemeral: true,
      });
    if (targetMember.id === interaction.user.id)
      return interaction.reply({
        content: "**You cannot kick yourself !**",
        ephemeral: true,
      });
    if (targetMember.id === client.user.id)
      return interaction.reply({
        content: "**I can't kick myself 🤓**",
        ephemeral: true,
      });
    if (
      (interaction.member.roles?.highest.position <=
        targetMember.roles?.highest.position &&
        interaction.member.id !== interaction.guild.ownerId) ||
      targetMember.id === interaction.guild.ownerId
    )
      return interaction.reply({
        content: `You cannot kick **${targetMember.user.username}** 👀`,
        ephemeral: true,
      });
    if (!targetMember.kickable)
      return interaction.reply(
        `**I couldn't kick \`${targetMember.user.username}\`, Please my role position.**`
      );

    await interaction.deferReply();

    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const alertMember = interaction.options.getBoolean("alert_member") ?? false;

    try {
      if (alertMember)
        await targetMember.send({
          embeds: [
            {
              title: "You Were Kicked",
              description: `Reason \n > ${reason}`,
              color: "#fa1a1a",
              timestamp: Date.now(),
              footer: {
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              },
            },
          ],
        });
    } catch {
    } finally {
      targetMember
        .kick(reason)
        .then(() =>
          interaction.editReply(
            `Kicked **${targetMember.user.username}** from the server 🛫\nReason: ${reason}`
          )
        );
    }
  },
};
