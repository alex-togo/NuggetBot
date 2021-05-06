require("dotenv").config({ path: "../../config/keys.env" });

module.exports = (Discord, client, message) => {
  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot)
    return;

  const args = message.content.slice(process.env.PREFIX.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command =
    client.commands.get(cmd) ||
    client.commands.find((a) => a.aliases && a.aliases.includes(cmd));

  //   if (command) command.execute(client, message, cmd, args, Discord);
  try {
    command.execute(message, args, cmd, client, Discord);
  } catch (err) {
    message.reply(
      "There was an error trying to execute this command, type !nugghelp for the command list."
    );
    console.log(err);
  }
};
