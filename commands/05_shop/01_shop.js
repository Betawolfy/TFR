const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders'); 
const config = require('../../config.json');

const apiCalls = require('../../assets/apiCall.json');
const {getRandomColor} = require('../../utils/randomizers/randomColor');
const LogCreator = require('../../utils/component/logCreator/logCreator');
const logger = new LogCreator();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('GET shop'),
    async execute(interaction) {
        const fetch = (await import('node-fetch')).default;

        // Initial embed with loading state
        const embed = new EmbedBuilder()
            .setTitle('[user@tfr-server]~$ get-shop --list')
            .setDescription('Retrieving shop data...\n')
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

            logger.logCommand(interaction, {
                commandType: 'GET',
                target: 'shop',
                status: 'success',
                itemCount: shop
            });

            // Divide shop items into pages
            const pages = [];
            for (let i = 0; i < shop.length; i += 5) {
                pages.push(shop.slice(i, i + 5));
            }

            const totalPages = Math.ceil(shop.length / 5);
            let pageIndex = 0;

                                                const displayPage = async (pageIndex) => {
                            // Réinitialiser l'embed
                            embed.setTitle(`[user@tfr-server]~$ get-shop --list --page ${pageIndex + 1}`)
                                .setDescription(`GET shop items\nUse \`/buy\` to purchase an item.`)
                                .setFooter({ text: `Page ${pageIndex + 1}/${totalPages} • End-Of-Packet` })
                                .setFields([]); // Utiliser setFields au lieu de spliceFields
                        
                            // Vérifier si le magasin est vide
                            if (!pages[pageIndex] || pages[pageIndex].length === 0) {
                                embed.setDescription('```bash\nNo items found in shop```');
                                return await message.edit({ embeds: [embed] });
                            }

                            // detect the rarity and changes the display on the field
                            pages[pageIndex].forEach(item => {
                                if (item.rarity === 'common') {
                                    item.rarity = '`🫥` Common';
                                } else if (item.rarity === 'rare') {
                                    item.rarity = '`⚡` Rare';
                                } else if (item.rarity === 'epic') {
                                    item.rarity = 'Epic';
                                } else if (item.rarity === 'legendary') {
                                    item.rarity = 'Legendary';
                                } else {
                                    item.rarity = 'Unknown';
                                }
                            });
                        
                            // Ajouter les items
                            const fields = pages[pageIndex].map((item, index) => ({
                                name: `\`${index + 1 + (pageIndex * 5)}\` ${item.name} - ${item.price}${config.economy.symbol}`,
                                value: `> ${item.description}\n${item.rarity}\n> ** **`,
                                inline: false
                            }));
                        
                            embed.setFields(fields);
                            
                            try {
                                await message.edit({ embeds: [embed] });
                            } catch (error) {
                                console.error('Error updating shop message:', error);
                            }
                        };

            await displayPage(0);

            // Add reaction controls
            await message.react('⬅️');
            await message.react('➡️');

            const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name);
            const collector = message.createReactionCollector({ filter, time: 20000 });

            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '⬅️' && pageIndex > 0) {
                    pageIndex--;
                    await displayPage(pageIndex);
                } else if (reaction.emoji.name === '➡️' && pageIndex < totalPages - 1) {
                    pageIndex++;
                    await displayPage(pageIndex);
                }
                await reaction.users.remove(user.id);
            });

        } catch (error) {
            console.error('Error:', error);
            logger.logError(error, {
                commandName: 'shop',
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                timestamp: new Date().toISOString()
            });
            embed.setDescription('```bash\nERROR: Failed to fetch shop data```')
                .setFooter({ text: 'Operation failed' })
                .setColor('#ff0000');
            await message.edit({ embeds: [embed] });
        }
    }
};