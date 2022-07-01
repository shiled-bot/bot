const { Client, ButtonInteraction } = require("discord.js");
const { removeWarnings } = require("../../models/warning.model");

/**
 * @param {Client} client
 * @param {ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  const { customId, member } = interaction;

  if (!member.permissions.has("ADMINISTRATOR")) return;
  const warnId = customId.slice(customId.indexOf(";") + 1);
  if (!warnId) return;

  await interaction.deferReply();

  try {
    const { deletedCount } = await removeWarnings(interaction.guildId, warnId);
    interaction.editReply(
      deletedCount > 0
        ? `Removed the warning with the id \`${warnId}\`\nBy: ${member.toString()}`
        : `Found **0** warnings with \`${warnId}\` id\nRequested by: ${member.toString()}`
    );
  } catch {}
};
