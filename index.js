const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
const fs = require("fs");
const cron = require("node-cron");
require("dotenv").config({ path: "./config/keys.env" });

const waterImg = new Discord.MessageAttachment(
  "./images/drink-water.png",
  "drink-water.png"
);

const sdbImg = new Discord.MessageAttachment("./images/sdb.jpg", "sdb.jpg");

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

client.on("shardError", (error) => {
  console.error("A websocket connection encountered an error:", error);
});

// Water Reminder

// placeholder var so first cron1.destroy() works
var cron1 = cron.schedule("0 0 * * *", () => {
  console.log("placeholder cron started");
});

// generate random hour between 10-22 for the water reminder cron job at 12am every day
cron.schedule("0 0 * * *", () => {
  // note: if (cron1){cron1.destroy()} doesn't work, causes too many schedules to start still
  cron1.destroy();
  var randomCronNum = (Math.floor(Math.random() * 13) + 10).toString();
  //console.log("before reminder: " + randomCronNum);

  // remind users to drink water once every day at a ranom hour between 10am and 10pm
  cron1 = cron.schedule(
    `0 ${randomCronNum} * * *`,
    () => {
      // channel you want the reminder posted in
      const channel = client.channels.cache.get(process.env.CHANNEL);
      // user role to message
      const roleId = process.env.ROLE;

      // channel.send(`<@&${roleId}> \nDRINK UP HYDRO HOMIES`, {
      //   files: [waterImg],
      // });

      const waterEmbed = {
        title: "💦 DRINK UP HYDRO HOMIES 💦",
        image: {
          url: "attachment://drink-water.png",
        },
      };

      channel.send(`<@&${roleId}>`, { files: [waterImg], embed: waterEmbed });
    },
    { timezone: "America/New_York" }
  );
});

//passing client and discord as params to other handler files
["command_handler", "event_handler"].forEach((handler) => {
  require(`./handlers/${handler}`)(client, Discord);
});

// SDB
client.on("message", (message) => {
  // no command for sdb, works if regex is found in any message
  let sdbRegex = /(sdb)|(shit damn boys)/;

  if (sdbRegex.test(message.content)) {
    message.reply({
      files: [sdbImg],
    });
  }
});

client.login(process.env.TOKEN);
