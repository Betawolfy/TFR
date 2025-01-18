const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-achievementlist')
        .setDescription('GET Achievement List'),
    
    async execute(interaction) {
        try {
            const response = await axios.get('http://localhost:3000/achievements');
            const achievements = response.data;
            const achievementEntries = Object.entries(achievements);

            const embed = new EmbedBuilder()
                .setTitle('[user@tfr-server]~$ get-achievementlist')
                .setColor('#202020')
                .setTimestamp()
                .setFooter({ text: 'Loading achievements...' });

            // Envoyer l'embed initial
            const message = await interaction.reply({ 
                embeds: [embed],
                fetchReply: true 
            });

            let currentIndex = 0;

            // Ajouter un achievement chaque seconde
            const interval = setInterval(() => {
                if (currentIndex >= achievementEntries.length) {
                    embed.setFooter({ text: 'End-Of-Packet' });
                    message.edit({ embeds: [embed] });
                    clearInterval(interval);
                    return;
                }

                const [id, achievement] = achievementEntries[currentIndex];
                embed.addFields({
                    name: achievement.icon + ' — ' + id + '. ' + achievement.numID,
                    value: `${achievement.description}, Max value: ${achievement.maxValue}`,
                });

                message.edit({ embeds: [embed] });
                currentIndex++;
            }, 1000);

        } catch (error) {
            console.error('Erreur lors de la récupération des achievements:', error);
            await interaction.reply({
                content: '```bash\n TypeError: An error occurred while fetching achievements.```',
                ephemeral: true
            });
        }
    },
};