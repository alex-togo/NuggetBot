module.exports = {
  name: "nugghelp",
  description: "lists all commands for nuggetbot",
  execute(message, args, cmd, client, Discord) {
    if (cmd === "nugghelp") {
      const msg = new Discord.MessageEmbed()
        .setTitle("NuggetBot Valid Commands:")
        .setColor(0xffc300).setDescription(`
                -- !nuggplay <Youtube Link> -- Play audio in your current voice channel
                -- !nuggplay <Channel Name> <Youtube Link> -- Play audio in a specific channel (NOTE: channel name is case sensitive)
                -- !nuggplay <user input text> -- Lists 5 of the top results from youtube based off your input
                -- !nuggplr <user input text> -- Plays the top youtube result based off your input
                -- !nuggskip -- Skip the current track (disconnects if no tracks left)
                -- !nuggqueue -- Shows the title of songs currently in the queue
                -- !nuggstop -- Disconnect the bot from the channel and clear the queue
                -- !nuggcurrent -- shows the title and url of the current track playing
                -- !nuggrepost <message> -- posts an alert with your custom message inside
                -- !secret -- Show secret/hidden commands
              `);
      message.channel.send(msg);
    }
  },
};
