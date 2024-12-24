const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const achievementsList = require('../../data/achievements_list.json'); // Charger le fichier JSON

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post-achievement')
        .setDescription('POST achievement')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('ARG1: User')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('achievement')
                .setDescription('ARG2: Achievement ID')
                .setRequired(true)
                .addChoices(
                    { name: '1. Did You Played In A Theater?', value: '1' },
                    { name: '2. Hardcore Survivalist', value: '2' },
                    { name: '3. How Did They Get Here?', value: '3' },
                    { name: '4. Gathering Autographs', value: '4' }
                ))
        .addIntegerOption(option =>
            option.setName('value')
                .setDescription('ARG3: Value')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user');
            const achievementId = interaction.options.getString('achievement');
            const value = interaction.options.getInteger('value');

            // Vérifier si l'achievement existe
            if (!achievementsList[achievementId]) {
                return interaction.reply({
                    content: 'Achievement non trouvé',
                    ephemeral: true
                });
            }

            // Créer l'embed initial avec "Loading..."
            const embed = new EmbedBuilder()
                .setTitle('[user@tfr-server]~$ post-achievement')
                .setDescription('Loading...')
                .setColor('#202020')
                .setTimestamp()
                .setFooter({ text: 'Processing request...' });

            const message = await interaction.reply({ 
                embeds: [embed],
                fetchReply: true 
            });

            // Attendre 1 seconde
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Faire la requête API
            const response = await axios.put(`http://localhost:3000/achievement/${user.id}/${achievementId}${value ? `/${value}` : ''}`);

            if (response.data.success) {
                embed
                    .setTitle('[user@tfr-server]~$ post-achievement ' + user.tag + ' ' + achievementId + (value ? ` ${value}` : ''))
                    .setDescription(`POST achievement for user ${user.tag} with achievement ID ${achievementId} and value ${value || 1}`)
                    .setColor('#00FF00')
                    .setFooter({ text: 'End-Of-Packet' });

                await message.edit({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur:', error.response?.data || error.message);
            await interaction.editReply({
                content: '```bash\n' + (error.response?.data?.error || error.message) + '```',
                ephemeral: true
            });
        }
    },
};