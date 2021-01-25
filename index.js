const Discord = require("discord.js");
const bot = new Discord.Client();

const ytdl = require("ytdl-core");
const cron = require("node-cron");
require("dotenv").config({ path: "./config/keys.env" });

const waterImg = new Discord.MessageAttachment(
  "./images/drink-water.png",
  "drink-water.png"
);

const sdbImg = new Discord.MessageAttachment("./images/sdb.jpg", "sdb.jpg");

const spookImg = new Discord.MessageAttachment(
  "./images/spook.png",
  "spook.png"
);

bot.on("ready", () => {
  console.log("NuggetBot is online!");
});

bot.on("shardError", (error) => {
  console.error("A websocket connection encountered an error:", error);
});

// Water Reminder

// placeholder var so first cron1.destroy() works
var cron1 = cron.schedule("0 0 * * *", () => {
  console.log("placeholder started");
});

// generate random hour between 10-22 for the water reminder cron job at 12am every day
cron.schedule("0 0 * * *", () => {
  // note: if (cron1){cron1.destroy()} doesn't work, causes too many schedules to start still
  cron1.destroy();
  var randomCronNum = (Math.floor(Math.random() * 13) + 10).toString();
  console.log("before reminder: " + randomCronNum);

  // remind users to drink water once every day at a ranom hour between 10am and 10pm
  cron1 = cron.schedule(
    `0 ${randomCronNum} * * *`,
    () => {
      // channel you want the reminder posted in
      const channel = bot.channels.cache.get(process.env.CHANNEL);
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

  playServer.dispatcher = await connection.play(
    ytdl(playServer.queue[0].yt, {
      highWaterMark: 1 << 25,
      filter: "audioonly",
    })
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

let ytRegex = /(^(http|https):\/\/(www.)?(youtube.com|youtu.be).*)/;

bot.on("message", async (message) => {
  if (message.content.charAt(0) === process.env.PREFIX) {
    let args = message.content.substring(process.env.PREFIX.length).split(" ");

    //check if channel name exists in voice channel list
    let channelExists = message.guild.channels.cache.some((channel) => {
      return channel.type === "voice" && message.content.includes(channel.name);
    });

    // grab yt link
    const ytGrab = args.find((element) => {
      return ytRegex.test(element);
    });

    //if one of the guild channel names exist in the string, extract it
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

    // push music to corresponding guild
    const pushMusicToGuild = (guildName, channelName) => {
      guildName.queue.push({ yt: ytGrab, channel: channelName });
      console.log(guildName.queue);
    };

    // connect to user's current channel and play
    const playCurrentChannel = async () => {
      try {
        const voiceConnection = await message.member.voice.channel.join();
        await play(voiceConnection, message);
      } catch (ex) {
        console.log(ex);
      }
    };

    // connect to specified channel in args and play
    const playSpecificChannel = async (channelName) => {
      try {
        const voiceConnection = await channelName.join();
        await play(voiceConnection, message);
      } catch (ex) {
        console.log(ex);
      }
    };

    // add to queue
    const addToQueue = () => {
      if (message.guild.me.voice.channel) {
        message.channel.send("Successfully added to the queue!");
      } else {
        if (channelExists) {
          playSpecificChannel(voiceChannelName);
        }
        if (!channelExists) {
          playCurrentChannel();
        }
      }
    };

    // clear queue and stop play
    const stopPlay = (guildName) => {
      // clear music queue
      guildName.queue = [];
      // if bot is in a voice channel
      if (message.guild.me.voice.channel) {
        // leave current voice channel in current guild
        message.guild.me.voice.channel.leave();
      }
    };

    let guildInMusicQueue = findGuild(musicQueue, message);

    switch (args[0]) {
      case "nuggplay":
        //if no second arg or second arg isn't a youtube link
        if (!ytRegex.test(ytGrab)) {
          message.reply("You need to provide a valid Youtube link!");
          return;
        }

        // if channel name in args is invalid
        if (args.length > 2 && !channelExists) {
          message.reply("Invalid channel name, type !nugghelp for more info.");
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

        //if the guild doesn't exist in the music queue, add it and push the current track
        if (!guildExists) {
          musicQueue.push({ guild: message.guild.id, queue: [] });
          // must create newGuild var after pushing to music queue
          // or pushMusicToGuild() function will not find a guild
          let newGuild = findGuild(musicQueue, message);
          pushMusicToGuild(newGuild, voiceChannelName);
          addToQueue();
        }
        if (guildExists) {
          pushMusicToGuild(guildInMusicQueue, voiceChannelName);
          addToQueue();
        }
        break;
      case "nuggskip":
        if (!guildInMusicQueue) {
          console.log("No tracks in the queue.");
          message.channel.send("There are no tracks currently in the queue!");
          return;
        }
        // if there is one song left, clear queue and leave voice chat
        if (guildInMusicQueue.queue.length == 1) {
          console.log("Skipped last song in the queue");
          message.channel.send("No tracks left in the queue, disconnecting.");
          stopPlay(guildInMusicQueue);
          return;
        }
        //remove first element in queue
        guildInMusicQueue.queue.shift();

        //play next track
        if (guildInMusicQueue.queue[0].channel != "") {
          playSpecificChannel(guildInMusicQueue.queue[0].channel);
        } else {
          playCurrentChannel();
        }
        // message.member.voice.channel.join().then((connection) => {
        //   play(connection, message);
        // });
        message.channel.send("Skipping to the next track...");

        break;
      case "nuggstop":
        console.log("nuggstop");
        stopPlay(guildInMusicQueue);
        message.channel.send("NuggetBot disconnected.");
        break;
      case "nuggqueue":
        let guildName = findGuild(musicQueue, message);
        if (guildInMusicQueue) {
          for (let i = 0; i < guildName.queue.length; i++) {
            ytdl.getBasicInfo(guildName.queue[i].yt).then((info) => {
              message.channel.send(info.videoDetails.title);
            });
          }
        }
        break;
      case "nugghelp":
        const msg = new Discord.MessageEmbed()
          .setTitle("NuggetBot Valid Commands:")
          .setColor(0xffc300).setDescription(`
        -- !nuggplay <Youtube Link> -- Play audio in your current voice channel
        -- !nuggplay <Channel Name> <Youtube Link> -- Play audio in a specific channel (NOTE: channel name is case sensitive)
        -- !nuggskip -- Skip the current track (disconnects if no tracks left)
        -- !nuggqueue -- shows the title of songs currently in the queue
        -- !nuggstop -- Disconnect the bot from the channel and clear the queue
        -- !secret -- Show secret/hidden commands
      `);
        message.channel.send(msg);
        break;
    }
  }
});

// Secrets
bot.on("message", (message) => {
  // no command for sdb, works if regex is found in any message
  let sdbRegex = /(sdb)|(shit damn boys)/;

  if (sdbRegex.test(message.content)) {
    message.reply({
      files: [sdbImg],
    });
  }

  // Secret Commands
  if (message.content.charAt(0) === "!") {
    let args = message.content.substring(process.env.PREFIX.length).split(" ");

    switch (args[0]) {
      case "mufasa":
        message.channel.send("https://www.youtube.com/watch?v=1AnG04qnLqI");
        break;
      case "spooky":
        const spookEmbed = {
          title: "YOU HAVE BEEN VISITED BY THE GHOST OF ROBBIE",
          image: {
            url: "attachment://spook.png",
          },
        };

        message.reply({ files: [spookImg], embed: spookEmbed });
        break;
      case "secret":
        const msg = new Discord.MessageEmbed()
          .setTitle("NuggetBot Secret Commands:")
          .setColor(0xffc300).setDescription(`
        -- !mufasa -- IT'S FRIDAY THENNN
        -- !spooky -- posts an ultra spooky image (not for the faint of heart)
      `);
        message.channel.send(msg);
        break;
    }
  }
});

bot.on("disconnect", () => {
  console.log("NuggetBot disconnected from the server.");
});

bot.login(process.env.TOKEN);
