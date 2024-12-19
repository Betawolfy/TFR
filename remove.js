const { REST, Routes } = require('discord.js');
const { clientId, guildIds, token } = require('./config.json');
const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started removing application (/) commands.`);
    for (const guildId of guildIds) {
      const commands = await rest.get(
        Routes.applicationGuildCommands(clientId, guildId)
      );
      for (const command of commands) {
        await rest.delete(
          Routes.applicationGuildCommand(clientId, guildId, command.id)
        );
        console.log(`Successfully deleted command ${command.name} for guild ${guildId}.`);
      }
    }
    console.log(`Successfully removed all application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();