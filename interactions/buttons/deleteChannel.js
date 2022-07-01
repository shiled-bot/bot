const { Client, ButtonInteraction } = require("discord.js");

/**
 * @param {Client} client
 * @param {ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  const { customId, member } = interaction;

  const targetChannelId = customId.slice(customId.indexOf(";") + 1);
  if (!targetChannelId) return;

  await interaction.deferReply();

  try {
    const targetChannel = await interaction.guild.channels.fetch(
      targetChannelId
    );

    if (!targetChannel.deletable)
      return interaction.editReply(
        `I don't have permissions to delete ${targetChannel.name}`
      );

    if (
      targetChannel.permissionsFor(member).has("MANAGE_CHANNELS") ??
      member.permissions.has("MANAGE_CHANNELS")
    ) {
      targetChannel.delete().then(() =>
        interaction.editReply(
          `
          Deleted \`${targetChannel.name}\`
          By: ${member.toString()}
            `
        )
      );
    }
  } catch {}
};
