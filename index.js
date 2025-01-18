// Connection to local variables
const config = require('./config');
const { Client, ActivityType, ChannelType, OAuth2Scopes, EmbedBuilder, ButtonBuilder, ButtonStyle, Collection, Events, messageLink} = require('discord.js')
const fs = require('fs');
const path = require('path');
const express = require('express');
let chalk;
import('chalk').then((module) => {
    chalk = module.default;
});
const axios = require('axios');
const FormData = require('form-data');
const { channel } = require('diagnostics_channel');

//Eslint
/* eslint-disable no-undef */

// Client
const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'GuildMessageReactions',
        'MessageContent',
        'GuildMembers',
        'GuildPresences',
    ],
});

// Command Handler

console.log('---- START UP ----');


// BIOS for startup
const bios = ['TerminalOS - made by Rayne',
              '--------------------------',
              'Version: 1.0.0',
              'Canal: Stable',
              '--------------------------',
              'PrimaryMaster: rootRayne',
              'PrimaryMachine: Lunix',
              'SecondaryMaster: n/a',
              'SecondaryMachine: n/a',
              '--------------------------',
              'CPU Model: Intal Core i99-10700K',
              'CPU Speed: 3THz',
              'RAM: 1094GB',
              'Storage: 100TB',
              '--------------------------',
              'Network: 1GB/s',
              '--------------------------',
]

// Log the BIOS
bios.forEach((line) => {
    console.log(line);
});

client.commands = new Collection();
client.categories = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const commandsFolder = path.join(__dirname, "commands");
const categories = fs.readdirSync(commandsFolder);

for (const category of categories) {
    const details = require(`${commandsFolder}/${category}/details.json`);
    console.log(`-${category} loaded`);
    const categoryFolderContent = fs.readdirSync(path.join(commandsFolder, category));
    const commandFiles = categoryFolderContent.filter(file => file.endsWith(".js"));
    const commandsName = [];

    for (const commandFile of commandFiles) {
        const commandName = commandFile.replace(".js", "");
        /** @type {import("../types/command")} */
        const command = require(`${commandsFolder}/${category}/${commandFile}`);

        // On ajoute la commande à la catégorie.
        commandsName.push(commandName);

        // On ajoute la catégorie a la collection.
        client.commands.set(commandName, {
            category,
            ...command
        });

        console.log(` |_>${commandName}`);
    }

    // On définit toutes les commandes dans cette catégorie.
    client.categories.set(category, {
        details,
        commandsName
    });
    //console.log(`${category} has been loaded.`);
};

// Event Handler
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isCommand()) {
        /**
         * Log message containing the date, channel ID, executed command, and user tag.
         * @type {string}
         */
        const logMessage = `Date: ${new Date().toISOString()}, server: ${interaction.guild.name} (${interaction.guildId}) Canal: ${interaction.channelId}, Command executed: ${interaction.commandName} par ${interaction.user.tag} (${interaction.user.id})\n`;
        fs.appendFile('./logs/logs.txt', logMessage, err => {
            if (err) {
                console.error('Erreur lors de l\' criture du fichier de log:', err);
            }
        });
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: `I was intended to have another interaction after this one, but I wasn't able to finish it. Probably because i can't DM this person or because the next interaction is not known. Please contact \`betawolfy\` if you believe we can fix the issue.`, ephemeral: true });
        } else {
            const errorImages = [
                'https://www.antivirusunite.com/assets/APPLe.Error.Bots/Error_Dumpty.png',
                'https://www.antivirusunite.com/assets/APPLe.Error.Bots/Error_First.png',
                'https://www.antivirusunite.com/assets/APPLe.Error.Bots/Error_Gaster.png',
                'https://www.antivirusunite.com/assets/APPLe.Error.Bots/Error_Free.png',
                'https://www.antivirusunite.com/assets/APPLe.Error.Bots/Error_Spanish.png'
            ];
            const specialImage = 'https://tinyface.net/img/emotes/tinycode.png';

            const images = [];
            for (let i = 0; i < 28; i++) {
                images.push(errorImages[i % errorImages.length]);
            }
            images.push(specialImage);

            // S lectionner une image au hasard
            const randomImage = images[Math.floor(Math.random() * images.length)];

            const errorMessages = [
                `There was an error while executing this command!\n ${randomImage}`,
                `An error occurred while executing this command!\n ${randomImage}`,
                `I'm sorry, what the actual frick you mean?\n ${randomImage}`,
                `I'm sorry, I can't do that.\n ${randomImage}`,
                `An error occurred while executing this command!\n ${randomImage}`,
                `L. Just L! You got a error!\n ${randomImage}`,
                `congrats! You got an error! Here's your medal!\n ${randomImage}`,
                `:-) ECHO.\n -#You got an error!`,
            ]

            const randomMessages = errorMessages[Math.floor(Math.random() * errorMessages.length)];

            await interaction.reply({ content: `${randomMessages}`, ephemeral: true });
        }
    }
});

// easter egg: when user says "egg", send a egg emoji
client.on('messageCreate', message => {
    if (message.content.toLowerCase() === 'egg') {
        message.react('🥚');
    }
});

client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === '[user@tfr-server]~') {
        message.reply('```bash\nPlease enter a command.\n```');
    }
});

//require('./API');
// Log when the bot is ready
client.login(config.token);

// When silli bot is ready
// Only once when the bot is ready
client.on('ready', () => {
    console.log(chalk.green(`Logged in as ${client.user.tag}!`));
    try {
        client.user.setPresence({
            activities: [{ name: "Ptioh.exe", type: 4 }],
            status: 'online', // 'online', 'dnd', 'idle', 'invisible'
        });
    } catch (error) {
        console.error(`Failed to set activity: ${error}`);
    }
});