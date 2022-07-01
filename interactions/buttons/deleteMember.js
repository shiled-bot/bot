const { Client, ButtonInteraction, GuildMember, User } = require("discord.js");

/**
 * @param {Client} client
 * @param {ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  const { customId, member } = interaction;

  if (!member.permissions.has("MANAGE_ROLES")) return;
  const args = customId.split(";").slice(1);
  const userId = args[0];
  const deleteType = args[1];
  if (!deleteType || !userId) return;

  await interaction.deferReply();

  /**
   * @param {GuildMember | User} target
   */
  const banUser = (target) => {
    if (!interaction.guild.me.permissions.has("BAN_MEMBERS"))
      return interaction.editReply(
        "I don't have permissions to ban. Please check my permissions. 😕"
      );
    if (target.guild && !target.bannable)
      return interaction.editReply(
        `*I couldn't ban ${target.toString()}, Please check my role position.`
      );

    interaction.guild.bans.create(target).then(() =>
      interaction.editReply(
        `
      Banned \`${target.displayName ?? target.username}\`
      By: ${target.toString()}
        `
      )
    );
  };

  try {
    const member = await interaction.guild.members.fetch(userId);

    if (deleteType === "kick") {
      if (!target.kickable)
        return interaction.editReply(
          `*I couldn't kick ${member.toString()}, Please check my role position.`
        );

      member.kick().then(() =>
        interaction.editReply(
          `
      Kicked \`${member.displayName}\`
      By: ${member.toString()}
        `
        )
      );
    } else if (deleteType === "ban") banUser(member);
  } catch {
    banUser(await client.users.fetch(userId));
  }
};
