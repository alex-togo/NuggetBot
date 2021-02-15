const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
const fs = require("fs");
require("dotenv").config({ path: "./config/keys.env" });

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

//passing client and discord as params to other handler files
["command_handler", "event_handler"].forEach((handler) => {
  require(`./handlers/${handler}`)(client, Discord);
});

client.login(process.env.TOKEN);
