const Discord = require("discord.js");
const bot = new Discord.Client();

const ytdl = require("ytdl-core");
const cron = require("node-cron");
require("dotenv").config({ path: "./config/keys.env" });

const waterImg = new Discord.MessageAttachment(
  "./images/drink-water.png",
  "drink-water.png"
);

bot.on("ready", () => {
  console.log("NuggetBot is online!");
});

// Water Reminder

// every time cron runs, a new random num between 3-8 is generated for the hour interval
cron.schedule(
  `0 10-23/${(Math.floor(Math.random() * 6) + 3).toString()} * * *`,
  () => {
    // HYDRO HOMIES
    // drink-water channel
    const channel = bot.channels.cache.get("715952134960447508");
    // hydro homies role
    const roleId = "715952532068761614";

    channel.send(`<@&${roleId}> \nDRINK UP HYDRO HOMIES`, {
      files: [waterImg],
    });
  },
  { timezone: "America/New_York" }
);

// -----------------------------------Helper Functions-----------------------------------

// finds the corresponding guild in the array
const findGuild = (arr, message) => {
  let result = arr.find((element) => {
    return element.guild === message.guild.id;
  });
  return result;
};

// play audio
const play = async (connection, message) => {
  let playServer = findGuild(musicQueue, message);

  playServer.dispatcher = connection.play(
    ytdl(playServer.queue[0], { filter: "audioonly" })
  );

  playServer.dispatcher.on("finish", function () {
    // go to next item in queue
    console.log("Audio ended, playing next in queue");
    playServer.queue.shift();

    // if no more items in queue, disconnect; otherwise, play next
    if (playServer.queue.length === 0) {
      console.log("Queue is empty, disconnecting");
      connection.disconnect();
    } else {
      play(connection, message);
    }
  });
};

// ---------------------------------------------------------------------------------------

// Main Music Command
let musicQueue = [];

let ytRegex = /(^(http|https):\/\/(www\.|m\.)(youtube\.com|youtu\.be)\/(watch\?v=)?[a-zA-Z0-9_-]{11}$)/;

bot.on("message", async (message) => {
  if (message.content.charAt(0) === process.env.PREFIX) {
    let args = message.content.substring(process.env.PREFIX.length).split(" ");

    let ytGrab = args.find((element) => {
      return ytRegex.test(element);
    });

    //check if channel name exists in voice channel list
    let channelExists = message.guild.channels.cache.some((channel) => {
      return channel.type === "voice" && message.content.includes(channel.name);
    });

    //if one of the guild channel names exist in the string, extract it.
    let voiceChannelName = "";
    if (channelExists) {
      voiceChannelName = message.guild.channels.cache.find((channel) => {
        if (
          channel.type === "voice" &&
          message.content.includes(channel.name)
        ) {
          return channel;
        }
      });
    }

    switch (args[0]) {
      case "nuggplay":
        //if no second arg or second arg isn't a youtube link
        if (!ytRegex.test(ytGrab)) {
          message.reply(
            "You need to provide a valid Youtube link! Example: https://www.youtube.com/watch?v=jNQXAC9IVRw or https://www.youtu.be/watch?v=jNQXAC9IVRw"
          );
          return;
        }

        // check if user is in voice AND no voice channel name is supplied
        if (message.member.voice.channel === null && !channelExists) {
          message.channel.send("You must be in a voice channel first.");
          return;
        }

        // return true if if guild already exists in the array
        let guildExists = musicQueue.some((element) => {
          return element.guild === message.guild.id;
        });

        // TO BE ADDED: if url exists

        //if the guild doesn't exist, add it and push the current
        if (!guildExists) {
          musicQueue.push({ guild: message.guild.id, queue: [] });
          let guildInMusicQueue = findGuild(musicQueue, message);
          guildInMusicQueue.queue.push(ytGrab);

          if (message.guild.me.voice.channel) {
            console.log("Connection exists!");
            message.channel.send("Successfully added to the queue!");
          } else {
            if (channelExists) {
              try {
                const voiceConnection = await voiceChannelName.join();
                await play(voiceConnection, message);
              } catch (ex) {
                console.log(ex);
              }
            }
            if (!channelExists) {
              try {
                const voiceConnection2 = await message.member.voice.channel.join();
                await play(voiceConnection2, message);
              } catch (ex) {
                console.log(ex);
              }
            }
          }
        }
        if (guildExists) {
          let guildInMusicQueue = findGuild(musicQueue, message);
          guildInMusicQueue.queue.push(ytGrab);

          if (message.guild.me.voice.channel) {
            console.log("Connection exists!");
            message.channel.send("Successfully added to the queue!");
          } else {
            if (channelExists) {
              try {
                const voiceConnection = await voiceChannelName.join();
                await play(voiceConnection, message);
              } catch (ex) {
                console.log(ex);
              }
            }
            if (!channelExists) {
              try {
                const voiceConnection2 = await message.member.voice.channel.join();
                await play(voiceConnection2, message);
              } catch (ex) {
                console.log(ex);
              }
            }
          }
        }
        // console.log("musicQueue: ");
        // console.log(musicQueue);
        break;
      case "nuggskip":
        let guildInMusicQueue = findGuild(musicQueue, message);
        //if last item or empty queue, disconnect
        if (guildInMusicQueue.queue.length <= 1) {
          guildInMusicQueue.queue = [];
          message.guild.me.voice.channel.leave();
        } else {
          //remove first element in queue
          guildInMusicQueue.queue.shift();
          //play next song
          message.member.voice.channel.join().then((connection) => {
            play(connection, message);
          });
        }
        break;
      case "nuggstop":
        console.log("nuggstop");
        let guildInMusicQueue2 = findGuild(musicQueue, message);
        // clear music queue
        guildInMusicQueue2.queue = [];
        // if bot is in a voice channel
        if (message.guild.me.voice.channel) {
          // leave current voice channel in current guild
          message.guild.me.voice.channel.leave();
          message.channel.send("NuggetBot disconnected.");
        }
        break;
      case "nugghelp":
        const msg = new Discord.MessageEmbed()
          .setTitle("NuggetBot Valid Commands:")
          .setColor(0xffc300).setDescription(`
        -- !nuggplay <Youtube Link> -- to play audio in your current voice channel
        -- !nuggplay <Channel Name> <Youtube Link> -- to play audio in a channel without being in the channel yourself
        -- !nuggskip -- skip the current track
        -- !nuggstop -- to disconnect the bot from the voice channel
        -- !secret -- show secret/hidden commands
      `);
        message.channel.send(msg);
        break;
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
    }
  }
});

bot.on("disconnect", () => {
  console.log("NuggetBot disconnected from the server.");
});

bot.login(process.env.TOKEN);
