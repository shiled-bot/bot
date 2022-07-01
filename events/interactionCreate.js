const { Client, Interaction } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");

const cooldowns = []; // cooldown 5 sec for each command

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = (client, interaction) => {
  if (!interaction.guild) return;

  // Slash Commands
  if (interaction.isCommand()) {
    // Cooldowns
    const TIME = 5000;
    const cooldown = cooldowns.find((cd) => cd.user === interaction.user.id);
    const remTime = Date.now() - cooldown?.timestamp;

    if (cooldown && remTime < TIME)
      return interaction.reply({
        content: `Cool down, ends <t:${Math.round(remTime / 1000)}:R>`,
        ephemeral: true,
      });

    let cooldowndIndex =
      cooldowns.push({ user: interaction.user.id, timestamp: Date.now() }) - 1;
    setTimeout(() => cooldowns.splice(cooldowndIndex, 1), TIME);

    client.commands.get(interaction.commandName).run(client, interaction);
  }

  // Buttons
  if (interaction.isButton()) {
    // format: buttonName;arg1;arg2;...

    const { customId } = interaction;
    const separatorIndex = customId.indexOf(";");
    const targetButton = customId.slice(
      0,
      separatorIndex !== -1 ? separatorIndex : customId.length
    );

    client.interactions.get(targetButton).run(client, interaction);
  }
};
