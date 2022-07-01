const { Client, ButtonInteraction } = require("discord.js");

/**
 * @param {Client} client
 * @param {ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  const { customId, member } = interaction;

  if (!member.permissions.has("MANAGE_ROLES")) return;
  const roleId = customId.slice(customId.indexOf(";") + 1);
  if (!roleId) return;

  await interaction.deferReply();

  try {
    const role = await interaction.guild.roles.fetch(roleId);

    if (!role.editable)
      return interaction.editReply(
        `I don't have permissions to delete ${role.name}`
      );

    role.delete().then(() =>
      interaction.editReply(
        `
      Deleted \`${role.name}\`
      By: ${member.toString()}
        `
      )
    );
  } catch {}
};
