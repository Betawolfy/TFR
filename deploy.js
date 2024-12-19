const { REST, Routes } = require('discord.js');
const { clientId, guildIds, token } = require('./config.json'); // guildIds should be an array
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, './commands');
const commandFolders = fs.readdirSync(foldersPath);

// Define folders to exclude
const excludeFolders = [];

for (const folder of commandFolders) {
  if (excludeFolders.includes(folder)) {
    continue; // Skip the folder if it's in the exclude list
  }
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    for (const guildId of guildIds) {
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
    }
  } catch (error) {
    console.error(error);
  }
})();