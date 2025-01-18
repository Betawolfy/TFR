const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const config = require('../../config.json');
const apiCalls = require('../../assets/apiCall.json');
const {getRandomColor} = require('../../utils/randomizers/randomColor');

const { hasRolePermissionLevel, getHighestUserRole } = require('../../utils/component/isValidPermissionLevel/isValidPermissionLevel');
const EmbedHelper = require('../../utils/component/embedHelper/embedHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-money')
        .setDescription('POST ADD money')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('ARG01 user')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('ARG02 amount to add')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

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
            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ post-money --amount ${amount} --user "${user.tag}"`)
                .setDescription('POSTing money transfer...\n')
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

            const response = await fetch(`${apiCalls.economy.addMoney}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userID: user.id, amount, serverID: interaction.guild.id })
            });

            const result = await response.json();

            if (!response.ok) {
                embed.setDescription('ERROR: Failed to add money')
                    .setFooter({ text: 'Operation failed' })
                    .setColor('#ff0000');
                return await message.edit({ embeds: [embed] });
            }

            embed.setDescription(`POST money to ${user.tag}`)
                .setFooter({ text: 'End-Of-Packet' })
                .addFields({
                    name: `${config.assets.emoji.wallet} Transaction Details`,
                    value: `Added **${amount}** ${config.economy.symbol} to **${user.username}**'s balance`,
                    inline: true
                });

            await message.edit({ embeds: [embed] });

        } catch (error) {
            console.error('Error while adding money:', error);
            await interaction.editReply({
                content: '```bash\nAn error occurred while adding money. Please try again.```',
                ephemeral: true
            });
        }
    }
};