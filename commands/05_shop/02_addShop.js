const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const config = require('../../config.json');
const {getRandomColor} = require('../../utils/randomizers/randomColor');
const apiCalls = require('../../assets/apiCall.json');

const { hasRolePermissionLevel, getHighestUserRole } = require('../../utils/component/isValidPermissionLevel/isValidPermissionLevel');
const EmbedHelper = require('../../utils/component/embedHelper/embedHelper');

const LogCreator = require('../../utils/component/logCreator/logCreator');
const logger = new LogCreator();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop-post') 
        .setDescription('POST AddShop')
        .addStringOption(option => option
            .setName('name')
            .setDescription('Args_00 name') 
            .setRequired(true))
        .addStringOption(option => option
            .setName('description')
            .setDescription('Args_01 description')
            .setRequired(true))
        .addStringOption(option => option
            .setName('rarity')
            .setDescription('Args_03 rarity')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('price')
            .setDescription('Args_02 price')
            .setRequired(true)),

    async execute(interaction) {
        logger.logCommand(interaction, { customArg: 'customValue' });
        // Vérification des permissions
        const highestRole = getHighestUserRole(interaction.member, config);
        if (highestRole !== 'ADMIN' && !hasRolePermissionLevel(interaction.member, 'MODERATOR', config)) {
            const errorEmbed = EmbedHelper.createErrorEmbed(
                "You need a higher permission level to use this command. Required level: `MODERATOR`, `ADMIN`.",
                "403"
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            const name = interaction.options.getString('name');
            const description = interaction.options.getString('description');
            const price = interaction.options.getInteger('price');
            const rarity = interaction.options.getString('rarity');

            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ post-shop --item "${name}"`)
                .setDescription('POSTing item to shop...' + '\n')
                .setAuthor({ name: '127.0.0.1:8080', iconURL: config.server.icon })
                .setColor(getRandomColor())
                .setTimestamp()
                .setFooter({ text: `Latency: ${Date.now() - interaction.createdTimestamp}ms` });

            const message = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            // Simulate loading
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                const response = await fetch(`${apiCalls.shop.getShop}/${interaction.guild.id}`);
                const shop = await response.json();

                // Check for duplicate
                if (shop.some(item => item.name === name)) {
                    embed.setDescription('ERROR: Item already exists')
                        .setFooter({ text: 'Operation failed' })
                        .setColor('#ff0000');
                    return await message.edit({ embeds: [embed] });
                }

                // Add item
                await fetch(`${apiCalls.shop.addShop}/${interaction.guild.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([...shop, {
                        name,
                        description,
                        price,
                        rarity
                    }])
                });

                embed.setDescription(`POST shop item "${name}"`)
                    .setFooter({ text: 'End-Of-Packet' })
                    .addFields(
                        { name: 'Item Name', value: name, inline: true },
                        { name: 'Description', value: description, inline: true },
                        { name: 'Price', value: `${price}${config.economy.symbol}`, inline: true },
                        { name: 'Rarity', value: rarity, inline: true }
                    );

                await message.edit({ embeds: [embed] });

                // Execute deploy.js
                exec('node deploy.js', (error, stdout, stderr) => {
                    if (error) console.error(`Error executing deploy.js: ${error.message}`);
                    if (stderr) console.error(`stderr: ${stderr}`);
                });
            } catch (error) {
                // save the error to a log file
                console.error('Error:', error);
                logger.logError(error, { commandName: interaction.commandName });
                embed.setDescription('ERROR: Failed to update shop')
                    .setFooter({ text: 'Operation failed' })
                    .setColor('#ff0000');
                await message.edit({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error:', error);
            logger.logError(error, { commandName: interaction.commandName });
            await interaction.editReply({
                content: '```bash\nAn error occurred while adding the item. Please try again.```',
                ephemeral: true
            });
        }
    }
};