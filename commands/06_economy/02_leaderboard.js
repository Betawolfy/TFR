const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const config = require('../../config.json');
const randomColor = require('../../utils/randomizers/randomColor');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eco-leaderboard')
        .setDescription('GET leaderboard'),
    async execute(interaction) {
        try {
            // Initial loading embed
            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ get-leaderboard`)
                .setDescription('Retrieving leaderboard data...\n')
                .setAuthor({ name: '127.0.0.1:8080', iconURL: config.server.icon })
                .setColor(randomColor())
                .setTimestamp()
                .setFooter({ text: `Latency: ${Date.now() - interaction.createdTimestamp}ms` });

            const message = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            // Simulate loading
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await axios.get(`http://localhost:${config.port}/api/bits-leaderboard`);
            const leaderboard = response.data;

            // Sort the leaderboard
            const sortedLeaderboard = leaderboard.sort((a, b) => b.balance - a.balance);

            // Divide leaderboard into pages
            const pages = [];
            for (let i = 0; i < sortedLeaderboard.length; i += 10) {
                pages.push(sortedLeaderboard.slice(i, i + 10));
            }

            const totalPages = Math.ceil(sortedLeaderboard.length / 10);

            // Function to display a specific page
            const displayPage = async (pageIndex) => {
                embed.setTitle(`[user@tfr-server]~$ get-leaderboard --page ${pageIndex + 1}`)
                    .setDescription(`GET leaderboard data\n\n${pages[pageIndex].map((user, index) => 
                        `${index + 1 + pageIndex * 10}. <@${user.id}> • ${user.balance} ${config.economy.symbol}`).join('\n')}`)
                    .setFooter({ text: `Page ${pageIndex + 1}/${totalPages} • End-Of-Packet` });

                await message.edit({ embeds: [embed] });
            };

            // Display first page
            await displayPage(0);

            // Add reaction controls
            await message.react('⬅️');
            await message.react('➡️');

            let pageIndex = 0;
            const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
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
            console.error(error);
            await interaction.editReply({
                content: '```bash\nERROR: Failed to fetch leaderboard data```',
                ephemeral: true
            });
        }
    }
};