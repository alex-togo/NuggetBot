const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

let musicQueue = [];

module.exports = {
  name: "play",
  description: "music player and associated commands",
  aliases: [
    "nuggplay",
    "nuggstop",
    "nuggskip",
    "nuggqueue",
    "nugghelp",
    "nuggpl",
    "nuggplr",
    "nuggplayrandom",
    "nuggcurrent",
  ],
  async execute(message, args, cmd, client, Discord) {
    //check if channel name exists in voice channel list
    let channelExists = message.guild.channels.cache.some((channel) => {
      return channel.type === "voice" && message.content.includes(channel.name);
    });

    // grab yt link
    const ytGrab = args.find((url) => {
      return ytdl.validateURL(url);
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
    };

    // connect to user's current channel and play
    const playCurrentChannel = async () => {
      try {
        const voiceConnection = await message.member.voice.channel.join();
        play(voiceConnection, message);
      } catch (ex) {
        console.log(ex);
      }
    };

    // connect to specified channel in args and play
    const playSpecificChannel = async (channelName) => {
      try {
        const voiceConnection = await channelName.join();
        play(voiceConnection, message);
      } catch (ex) {
        console.log(ex);
      }
    };

    // add to queue message, else play
    const addToQueue = (title) => {
      if (message.guild.me.voice.channel) {
        message.channel.send(`Successfully added ${title} the queue!`);
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

    if (cmd === "nuggcurrent") {
      try {
        let info = await ytdl.getInfo(guildInMusicQueue.queue[0].yt);
        message.channel.send(
          `Current track: ${info.videoDetails.title}\nLink: ${guildInMusicQueue.queue[0].yt}`
        );
      } catch (e) {
        message.channel.send("No tracks currently playing.");
      }
    }

    if (cmd === "nuggplay" || cmd === "nuggpl") {
      //if no second arg or second arg isn't a youtube link

      // if channel name in args is invalid
      // if (args.length > 2 && !channelExists) {
      //   message.reply("Invalid channel name, type !nugghelp for more info.");
      //   return;
      // }

      // check if user is in voice AND no voice channel name is supplied
      if (message.member.voice.channel === null && !channelExists) {
        message.channel.send("You must be in a voice channel first.");
        return;
      }

      // return true if guild already exists in the array
      let guildExists = musicQueue.some((element) => {
        return element.guild === message.guild.id;
      });

      if (!ytdl.validateURL(ytGrab)) {
        // message.reply("You need to provide a valid Youtube link!");
        const videoFinder = async (query) => {
          let videoResult = [];
          try {
            videoResult = await ytSearch(query);
          } catch (ex) {
            console.log(ex);
            return videoResult;
          }

          const videoList = [];

          //get top 5 videos for video embed
          for (let i = 0; i < 5; i++) {
            videoList.push(videoResult.videos[i]);
          }

          return videoList;
        };

        const videos = await videoFinder(args.join(" "));

        if (!videos[0]) {
          message.channel.send("No video results found.");
          return;
        }

        const videoEmbed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setTitle("Youtube search results:");

        for (let i = 0; i < 5; i++) {
          videoEmbed.addFields({
            name: `${i + 1}: ${videos[i].title}`,
            value: "\u200B",
          });
        }

        message.channel.send(videoEmbed);

        if (videos) {
          let filter = (m) => m.author.id === message.author.id;
          message.channel.send("Choose a video").then(() => {
            message.channel
              .awaitMessages(filter, {
                max: 1,
                time: 30000,
                errors: ["time"],
              })
              .then((message) => {
                message = message.first();
                let num = parseInt(message.content);
                if (num >= 1 && num <= 5) {
                  if (!guildExists) {
                    musicQueue.push({ guild: message.guild.id, queue: [] });
                    // must create newGuild var after pushing to music queue
                    // or pushMusicToGuild() function will not find a guild
                    let newGuild = findGuild(musicQueue, message);
                    newGuild.queue.push({
                      yt: videos[num - 1].url,
                      channel: message.member.voice.channel,
                    });
                    addToQueue(videos[num - 1].title);
                  }
                  if (guildExists) {
                    guildInMusicQueue.queue.push({
                      yt: videos[num - 1].url,
                      channel: message.member.voice.channel,
                    });
                    addToQueue(videos[num - 1].title);
                  }
                }
              })
              .catch((e) => {
                message.channel.send(`${e}`);
              });
          });
        }
      } else {
        // get video info to use title when adding to queue
        let info = await ytdl.getInfo(ytGrab);
        //if the guild doesn't exist in the music queue, add it and push the current track
        if (!guildExists) {
          musicQueue.push({ guild: message.guild.id, queue: [] });
          // must create newGuild var after pushing to music queue
          // or pushMusicToGuild() function will not find a guild
          let newGuild = findGuild(musicQueue, message);
          pushMusicToGuild(newGuild, voiceChannelName);
          addToQueue(info.videoDetails.title);
        }
        if (guildExists) {
          pushMusicToGuild(guildInMusicQueue, voiceChannelName);
          addToQueue(info.videoDetails.title);
        }
      }
    }
    if (cmd === "nuggplr" || cmd === "nuggplayrandom") {
      const videoFinder = async (query) => {
        let videoResult = [];
        try {
          videoResult = await ytSearch(query);
        } catch (ex) {
          console.log(ex);
          return videoResult;
        }

        //can add embed here and give user option to choose from many videos
        return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
      };

      const video = await videoFinder(args.join(" "));

      let guildExists = musicQueue.some((element) => {
        return element.guild === message.guild.id;
      });

      if (video) {
        if (!guildExists) {
          musicQueue.push({ guild: message.guild.id, queue: [] });
          // must create newGuild var after pushing to music queue
          // or pushMusicToGuild() function will not find a guild
          let newGuild = findGuild(musicQueue, message);
          newGuild.queue.push({
            yt: video.url,
            channel: message.member.voice.channel,
          });
          addToQueue(video.videoDetails.title);
        }
        if (guildExists) {
          guildInMusicQueue.queue.push({
            yt: video.url,
            channel: message.member.voice.channel,
          });
          addToQueue(video.videoDetails.title);
        }
      } else {
        message.channel.send("No video results found");
      }
    }
    if (cmd === "nuggskip") {
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
    }
    if (cmd === "nuggstop") {
      console.log("nuggstop");
      stopPlay(guildInMusicQueue);
      message.channel.send("NuggetBot disconnected.");
    }
    if (cmd === "nuggqueue") {
      let guildName = findGuild(musicQueue, message);
      if (!guildInMusicQueue) {
        message.channel.send("No tracks currently in the queue.");
        return;
      }
      if (guildInMusicQueue) {
        //implicit return for arrow function uses no return and no {}
        const videoResults = await Promise.all(
          guildName.queue.map(({ yt }) => ytdl.getInfo(yt))
        );

        //object destructuring: get title from videodetails
        const videoTitles = videoResults
          .map(({ videoDetails: { title } }, i) => i + 1 + ". " + title)
          .join("\n");

        message.channel.send(videoTitles);

        return;
      }
    }
  },
};

// -----------------------------------Helper Functions-----------------------------------

// finds the corresponding guild in the array
const findGuild = (arr, message) => {
  return arr.find((element) => {
    return element.guild === message.guild.id;
  });
};

// play audio
const play = async (connection, message) => {
  let playServer = findGuild(musicQueue, message);

  playServer.dispatcher = await connection.play(
    ytdl(playServer.queue[0].yt, {
      highWaterMark: 1 << 25,
      filter: "audioonly",
    }),
    { seek: 0, volume: 1 }
  );

  const info = await ytdl.getInfo(playServer.queue[0].yt);
  await message.channel.send(
    `Now playing ${info.videoDetails.title} (${Math.floor(
      info.videoDetails.lengthSeconds / 60
    )}:${
      info.videoDetails.lengthSeconds % 60 < 10
        ? "0" + Math.floor(info.videoDetails.lengthSeconds % 60)
        : Math.floor(info.videoDetails.lengthSeconds % 60)
    })`
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
