const Discord = require("discord.js");
const bot = new Discord.Client();

const config = require("./config.json");
const ytdl = require("ytdl-core");
const cron = require("node-cron");

const waterImg = new Discord.MessageAttachment(
  "./images/drink-water.png",
  "drink-water.png"
);

let servers = {};

bot.on("ready", () => {
  console.log("NuggetBot is online!");
});

// Water Reminder
//random hour between 3 and 5 hours
let randomInt = (Math.floor(Math.random() * 5) + 3).toString();
// between 10am and 11pm on 30mins of the hour, every 3-5 (random) hours
let cronTime = "30 10-23/" + randomInt + " * * *";

cron.schedule(cronTime, () => {
  // HYDRO HOMIES
  // drink-water channel
  const channel = bot.channels.cache.get("715952134960447508");
  // hydro homies role
  const roleId = "715952532068761614";
  channel.send(`<@&${roleId}> \nDRINK UP HYDRO HOMIES`);
  channel.send({ files: [waterImg] });
});

// Help Command
bot.on("message", (message) => {
  if (message.content.charAt(0) === config.prefix) {
    let args = message.content.substring(config.prefix.length).split(" ");

    if (args[0] === "nugghelp" && args.length === 1) {
      const msg = new Discord.MessageEmbed()
        .setTitle("Valid Commands:")
        .setColor(0xffc300).setDescription(`
        -- !nuggplay youtube link -- to play music from a youtube video link
        -- !nuggstop -- to disconnect the bot from the voice channel
        -- !playchan Channel Name youtube link -- to play a youtube link in any channel without having to be in the channel
      `);
      message.channel.send(msg);
    }
  }
});

// Mufasa Command
bot.on("message", (message) => {
  if (message.content.charAt(0) === "!") {
    let args = message.content.substring(config.prefix.length).split(" ");

    args = args.map((arg) => arg.toLowerCase());

    if (args[0] === "mufasa" && args.length === 1) {
      message.channel.send("https://www.youtube.com/watch?v=1AnG04qnLqI");
    }
  }
});

// Main Music Command
bot.on("message", (message) => {
  let ytRegex = /(^(http|https):\/\/(www.)?(youtube.com|youtu.be).*)/;

  if (message.content.charAt(0) === config.prefix) {
    let args = message.content.substring(config.prefix.length).split(" ");

    const play = (connection, message) => {
      let playServer = servers[message.guild.id];

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
        if (!servers[message.guild.id])
          servers[message.guild.id] = {
            queue: [],
          };

        let server1 = servers[message.guild.id];

        server1.queue.push(args[1]);

        if (!message.member.voice.connection) {
          message.member.voice.channel.join().then((connection) => {
            play(connection, message);
          });
        }
        break;
      // case "playchan1":
      //   if (!args[1] || !ytRegex.test(args[1])) {
      //     message.reply("You need to provide a valid Youtube link!");
      //     return;
      //   }

      //   if (!servers[message.guild.id])
      //     servers[message.guild.id] = {
      //       queue: [],
      //     };

      //   let server2 = servers[message.guild.id];

      //   server2.queue.push(args[1]);

      //   const channel = bot.channels.cache.get("715948266793074802");

      //   if (!message.member.voice.connection)
      //     channel.join().then((connection) => {
      //       play(connection, message);
      //     });

      //   break;
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

        let server3 = servers[message.guild.id];

        server3.queue.push(args[args.length - 1]);

        const channel2 = message.guild.channels.cache.find(
          (channel) => channel.name === channelName
        );

        if (!message.member.voice.connection)
          channel2.join().then((connection) => {
            play(connection, message);
          });
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

bot.login(config.token);
