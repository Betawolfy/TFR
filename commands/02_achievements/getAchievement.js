const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-achievements')
        .setDescription('GET USER Achievements')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('ARG1: User')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user');
            
            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ get-achievements ${user.tag}`)
                .setDescription('Retrieving achievements...')
                .setColor('#202020')
                .setTimestamp()
                .setFooter({ text: `Latency: ${Date.now() - interaction.createdTimestamp}ms` });

            const message = await interaction.reply({ 
                embeds: [embed],
                fetchReply: true 
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await axios.get(`http://localhost:3000/achievements/${user.id}`);
            const { userAchievements, allAchievements } = response.data;

            embed.setDescription(`GET ${user.tag} achievements`);
            embed.setFooter({ text: 'End-Of-Packet' });
            embed.spliceFields(0, embed.fields?.length || 0);

            for (const achievement of userAchievements) {
                const achievementInfo = allAchievements[achievement.name]; // Changé de numID à name
                if (achievementInfo) {
                    embed.addFields({
                        name: achievementInfo.icon + ' — ' + achievementInfo.numID,
                        value: `Progression: ${achievement.current}/${achievementInfo.maxValue}\n${achievementInfo.description}`,
                        inline: true
                    });
                }
            }

            await message.edit({ embeds: [embed] });

        } catch (error) {
            if (error.response?.status === 404) {
                await interaction.editReply({
                    content: "```bash\nThis user doesn't have any achievements```",
                    ephemeral: true
                });
            } else {
                console.error('Erreur:', error);
                await interaction.editReply({
                    content: '```bash\nAn error occurred while fetching achievements.```',
                    ephemeral: true
                });
            }
        }
    },
};