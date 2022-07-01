const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction } = require("discord.js");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("ping")
    .setDescription("📡 Tests bot response time"),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run(client, interaction) {
    const responseTime = Math.abs(Date.now() - interaction.createdTimestamp);
    interaction.reply({
      content: `\`\`\`js\n⌛ Response Time: ${responseTime} ms\n⏱️ Web Socket: ${client.ws.ping} ms\`\`\``,
      ephemeral: true,
    });
  },
};
