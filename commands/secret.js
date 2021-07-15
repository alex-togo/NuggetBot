require("dotenv").config({ path: "./config/keys.env" });

module.exports = {
  name: "secret",
  description: "lists all commands for nuggetbot",
  aliases: [
    "spooky",
    "mufasa",
    "nuggfortune",
    "cowboy",
    "nuggrepost",
    "cruelty",
  ],
  execute(message, args, cmd, client, Discord) {
    const spookImg = new Discord.MessageAttachment(
      "./images/spook.png",
      "spook.png"
    );

    const cowboyImg = new Discord.MessageAttachment(
      "./images/cowboy_text.jpg",
      "cowboy.jpg"
    );

    const crueltyImg = new Discord.MessageAttachment(
      "./images/cruelty.jpg",
      "cruelty.jpg"
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
    // if (cmd === "nuggfortune") {
    //   let randomNum = Math.floor(Math.random() * 10) + 1;
    //   if (
    //     randomNum === 1 ||
    //     randomNum === 2 ||
    //     randomNum === 3 ||
    //     randomNum === 4
    //   ) {
    //     message.reply("test1");
    //     return;
    //   }
    //   if (randomNum === 5 || randomNum === 6 || randomNum === 7) {
    //     message.reply(
    //       "test2"
    //     );
    //     return;
    //   }
    //   if (randomNum === 8 || randomNum === 9) {
    //     message.reply(
    //       "test3"
    //     );
    //   }
    //   if (randomNum === 10) {
    //     message.reply("test4");
    //     return;
    //   }
    // }

    if (cmd === "cowboy") {
      message.reply({
        files: [cowboyImg],
      });
      return;
    }

    if (cmd === "cruelty") {
      message.reply({
        files: [crueltyImg],
      });
      return;
    }

    if (cmd === "nuggrepost") {
      const msg = args.join(" ");
      message.channel.send(`
      🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\nWEE WOO WEE WOO\nALERT!! ALERT!!\n${
        msg ? msg : "YOU JUST MADE A REPOST"
      }\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
      `);
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
