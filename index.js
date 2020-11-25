const Discord = require("discord.js");
const bot = new Discord.Client();

const ytdl = require("ytdl-core");
const cron = require("node-cron");
require("dotenv").config({ path: "./config/keys.env" });

const waterImg = new Discord.MessageAttachment(
  "./images/drink-water.png",
  "drink-water.png"
);

let servers = {};

bot.on("ready", () => {
  console.log("NuggetBot is online!");
});

// Water Reminder

// every time cron runs, a new random num between 3-9 is generated for the hour interval
cron.schedule(
  `* 10-23/${(Math.floor(Math.random() * 7) + 3).toString()} * * *`,
  () => {
    // HYDRO HOMIES
    // drink-water channel
    const channel = bot.channels.cache.get("740665206056812676");
    // hydro homies role
    const roleId = "715952532068761614";
    //<@&${roleId}> \n
    channel.send(`<@&${roleId}> \nDRINK UP HYDRO HOMIES`, {
      files: [waterImg],
    });
    // channel.send({ files: [waterImg] });
  },
  { timezone: "America/New_York" }
);

// Help Command
bot.on("message", (message) => {
  if (message.content.charAt(0) === process.env.PREFIX) {
    let args = message.content.substring(process.env.PREFIX.length).split(" ");

    if (args[0] === "nugghelp" && args.length === 1) {
      const msg = new Discord.MessageEmbed()
        .setTitle("NuggetBot Valid Commands:")
        .setColor(0xffc300).setDescription(`
        -- !nuggplay youtube link -- to play music from a youtube link in your current voice channel
        -- !playchan Channel Name youtube link -- to play a youtube link in any channel without having to be in the channel (case sensitive)
        -- !nuggstop -- to disconnect the bot from the voice channel
        -- !secret -- show secret/hidden commands
      `);
      message.channel.send(msg);
    }
  }
});

// Secret Commands
bot.on("message", (message) => {
  if (message.content.charAt(0) === "!") {
    let args = message.content.substring(process.env.PREFIX.length).split(" ");

    switch (args[0]) {
      case "mufasa":
        message.channel.send("https://www.youtube.com/watch?v=1AnG04qnLqI");
        break;
      case "secret":
        message.reply(
          "LOL you thought I would just give you all the secret commands? YIKES"
        );
        break;
      // case "water":
      //   // HYDRO HOMIES
      //   // drink-water channel
      //   const channel = bot.channels.cache.get("740665206056812677");
      //   // hydro homies role
      //   const roleId = "779728231464566825";
      //   message.channel.send(`<@&${roleId}> \nDRINK UP HYDRO HOMIES`, {
      //     files: [waterImg],
      //   });
      //   // channel.send({ files: [waterImg] });
      //   break;
    }
  }
});

// Main Music Command
bot.on("message", (message) => {
  let ytRegex = /(^(http|https):\/\/(www.)?(youtube.com|youtu.be).*)/;

  if (message.content.charAt(0) === process.env.PREFIX) {
    let args = message.content.substring(process.env.PREFIX.length).split(" ");

    const play = (connection, message) => {
      let playServer = servers[message.guild.id];
      console.log(servers);

      playServer.dispatcher = connection.play(
        ytdl(playServer.queue[0], { filter: "audioonly" })
      );

      playServer.queue.shift();

      playServer.dispatcher.on("finish", function () {
        if (playServer.queue[0]) {
          play(connection, message);
        } else {
          connection.disconnect();
        }
      });
    };

    switch (args[0]) {
      case "nuggplay":
        if (!args[1] || !ytRegex.test(args[1])) {
          message.reply("You need to provide a valid Youtube link!");
          return;
        }
        if (!message.member.voice.channel) {
          message.reply("You must be in a voice channel to use the bot!");
          return;
        }
        // if server id not found, clear queue
        if (!servers[message.guild.id])
          servers[message.guild.id] = {
            queue: [],
          };

        console.log(servers);

        // todo: if server is already in servers object, add to that object not create a new one
        servers[message.guild.id].queue.push(args[1]);

        if (!message.member.voice.connection) {
          message.member.voice.channel.join().then((connection) => {
            play(connection, message);
          });
        }
        break;
      case "playchan":
        // get channel name by removing command and yt link (last arg)
        let channelName = message.content
          .replace("!playchan", "")
          .replace(args[args.length - 1], "")
          .trim();
        if (!args[args.length - 1] || !ytRegex.test(args[args.length - 1])) {
          message.reply("You need to provide a valid Youtube link!");
          return;
        }

        if (!servers[message.guild.id])
          servers[message.guild.id] = {
            queue: [],
          };

        servers[message.guild.id].queue.push(args[args.length - 1]);

        const channel2 = message.guild.channels.cache.find(
          (channel) => channel.name === channelName
        );

        if (!message.member.voice.connection && channel2) {
          channel2.join().then((connection) => {
            play(connection, message);
          });
        } else {
          message.reply(
            "Your channel name was not valid. Check casing and spelling."
          );
        }
        break;
      case "nuggstop":
        // if bot is in a channel, leave the channel
        if (message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave();
          message.channel.send("NuggetBot disconnected.");
        }
        break;
    }
  }
});

bot.login(process.env.TOKEN);
