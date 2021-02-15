require("dotenv").config({ path: "./config/keys.env" });

module.exports = {
  name: "secret",
  description: "lists all commands for nuggetbot",
  aliases: ["spooky", "mufasa"],
  execute(message, args, cmd, client, Discord) {
    const spookImg = new Discord.MessageAttachment(
      "./images/spook.png",
      "spook.png"
    );

    if (cmd === "secret") {
      const msg = new Discord.MessageEmbed()
        .setTitle("NuggetBot Secret Commands:")
        .setColor(0xffc300).setDescription(`
        -- !mufasa -- IT'S FRIDAY THENNN
        -- !spooky -- posts an ultra spooky image (not for the faint of heart)
      `);
      message.channel.send(msg);
      return;
    }
    if (cmd === "spooky") {
      const spookEmbed = {
        title: "YOU HAVE BEEN VISITED BY THE GHOST OF ROBBIE",
        image: {
          url: "attachment://spook.png",
        },
      };

      message.reply({ files: [spookImg], embed: spookEmbed });
      return;
    }
    if (cmd === "mufasa") {
      message.channel.send("https://www.youtube.com/watch?v=1AnG04qnLqI");
      return;
    }
  },
};
