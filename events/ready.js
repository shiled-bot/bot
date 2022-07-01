const { Client } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  console.log("Logged In As", "\x1b[36m", client.user.tag, "\x1b[0m");

  console.log("Reloading Commands ...");
  const commands = Array.from(
    client.commands.map(({ run, ...cmd }) => cmd).values()
  );

  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("Reloaded Commands");
  } catch (error) {
    console.error(error);
  }
};
