// setBio.js
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const randomColor = require('../../utils/randomizers/randomColor');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post-bio')
        .setDescription('POST USER bio')
        .addStringOption(option =>
            option.setName('bio')
                .setDescription('ARG1: Bio')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const user = interaction.user;
            const bio = interaction.options.getString('bio');
            const dataPath = path.resolve(__dirname, '../../data/users_achievements.json');
            let users = require(dataPath);

            // Vérifier et mettre à jour la structure utilisateur
            if (!users[user.id]) {
                users[user.id] = {
                    achievements: [],
                    bio: bio
                };
            } else {
                // Convertir l'ancien format (tableau) vers le nouveau format (objet)
                if (Array.isArray(users[user.id])) {
                    const achievements = users[user.id];
                    users[user.id] = {
                        achievements: achievements,
                        bio: bio
                    };
                } else {
                    users[user.id].bio = bio;
                }
            }

            fs.writeFileSync(dataPath, JSON.stringify(users, null, 4));

            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ set-user --bio --user "${user.tag}"`)
                .setDescription('POSTing bio...')
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setAuthor({ name: '127.0.0.1:8080', iconURL: config.server.icon })
                .setColor(randomColor())
                .setTimestamp()
                .setFooter({ text: `Latency: ${Date.now() - interaction.createdTimestamp}ms` });

            await interaction.reply({ embeds: [embed] });
            await new Promise(resolve => setTimeout(resolve, 1000));

            embed.setDescription(`POST ${user.tag} bio`);
            embed.setFooter({ text: 'End-Of-Packet' });
            embed.spliceFields(0, embed.fields?.length || 0);
            embed.addFields({
                name: 'Bio',
                value: bio
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '```bash\nAn error occurred while setting the bio. Please try again.```',
                ephemeral: true
            });
        }
    }
};