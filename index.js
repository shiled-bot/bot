require("dotenv").config();
const mongoose = require("mongoose");
const { DB_URI, TOKEN } = process.env;
const { readdirSync } = require("fs");
const { Intents, Client, Collection } = require("discord.js");
const client = new Client({
  presence: {
    status: "idle",
    activities: [{ name: "🚀", type: "PLAYING" }],
  },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.commands = new Collection();
client.interactions = new Collection();

readdirSync("./commands")
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
  });

readdirSync("./interactions").forEach((dir) => {
  readdirSync(`./interactions/${dir}`)
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const interaction = require(`./interactions/${dir}/${file}`);
      client.interactions.set(file.slice(0, file.indexOf(".js")), interaction);
    });
});

readdirSync("./events")
  .filter((result) => result.endsWith(".js") || result.endsWith("_events"))
  .forEach((result) => {
    if (result.endsWith("_events")) {
      const dir = result;
      const dirFiles = readdirSync(`./events/${dir}`).filter((result) =>
        result.endsWith(".js")
      );
      for (const event of dirFiles) {
        const eventHandler = require(`./events/${dir}/${event}`);
        client.on(
          event.slice(0, event.indexOf(".js")),
          eventHandler.bind(null, client)
        );
      }
    } else {
      const event = result;
      const eventHandler = require(`./events/${event}`);
      client.on(
        event.slice(0, event.indexOf(".js")),
        eventHandler.bind(null, client)
      );
    }
  });

mongoose.connect(DB_URI).then(() => {
  console.log("Connected to db 🚀");
  client.login(TOKEN);
});
