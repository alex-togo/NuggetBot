const Discord = require("discord.js");
const bot = new Discord.Client();

const config = require("./config.json");
const ytdl = require("ytdl-core");

const waterImg = new Discord.MessageAttachment(
  "./images/drink-water.png",
  "drink-water.png"
);

let servers = {};

bot.on("ready", () => {
  console.log("NuggetBot is online!");

  // HYDRO HOMIES

  // drink-water channel
  const channel = bot.channels.cache.get("715952134960447508");
  // hydro homies role
  const roleId = "715952532068761614";

  let date = new Date();
  let hour = date.getHours();

  if (hour > 12) {
    hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }

  if (hour % 3 === 0) {
    channel.send(`<@&${roleId}> \nDRINK UP HYDRO HOMIES`);
    channel.send({ files: [waterImg] });
  }
});

// Nugghelp
bot.on("message", (message) => {
  if (message.content.charAt(0) === config.prefix) {
    let args = message.content.substring(config.prefix.length).split(" ");

    if (args[0] === "nugghelp" && args.length === 1) {
      const msg = new Discord.MessageEmbed()
        .setTitle("Valid Commands:")
        .setColor(0xffc300).setDescription(`
        !nuggplay to play music from a youtube video link
        !nuggstop to disconnect the bot from the voice channel
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

bot.on("message", (message) => {
  var ytRegex = /(^(http|https):\/\/(www.)?(youtube.com).*)/;

  if (message.content.charAt(0) === config.prefix) {
    let args = message.content.substring(config.prefix.length).split(" ");

    switch (args[0]) {
      case "nuggplay":
        const play = (connection, message) => {
          var server = servers[message.guild.id];

          server.dispatcher = connection.play(
            ytdl(server.queue[0], { filter: "audioonly" })
          );

          server.queue.shift();

          server.dispatcher.on("finish", function () {
            if (server.queue[0]) {
              play(connection, message);
            } else {
              connection.disconnect();
            }
          });
        };

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

        let server = servers[message.guild.id];

        server.queue.push(args[1]);

        if (!message.member.voice.connection)
          message.member.voice.channel.join().then((connection) => {
            play(connection, message);
          });

        break;
      case "nuggstop":
        if (message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave();
          message.channel.send("Nuggetbot disconnected");
        }
        break;
    }
  }
});

bot.login(config.token);
