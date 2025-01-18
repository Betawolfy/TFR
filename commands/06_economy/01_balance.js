const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

const apiCalls = require('../../assets/apiCall.json');
const { hasRolePermissionLevel } = require('../../utils/component/isValidPermissionLevel/isValidPermissionLevel');
const EmbedHelper = require('../../utils/component/embedHelper/embedHelper');
const { getRandomColor } = require('../../utils/randomizers/randomColor');
const LogCreator = require('../../utils/component/logCreator/logCreator');
const randomString = require('../../utils/randomizers/randomString');
const { getRandomInt } = require('../../utils/randomizers/randomNumber');
const logger = new LogCreator();


module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-money')
        .setDescription('GET money')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('ARG01 user')
                .setRequired(true)),
    async execute(interaction) {
        logger.logCommand(interaction, {
            commandType: 'GET',
            target: 'money',
            status: 'success'
        });

        const user = interaction.options.getUser('user');
        const serverID = interaction.guild.id;
        const fetch = (await import('node-fetch')).default;

        if (!hasRolePermissionLevel(interaction.member, 'MEMBER', config)) {
            const errorEmbed = EmbedHelper.createErrorEmbed(
                "You need a higher permission level to use this command. Required level: `MEMBER`.",
                "403"
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }


        try {

            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ get-money --user "${user.tag}"`)
                .setDescription('Retrieving balance...')
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
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

            const response = await fetch(`${apiCalls.economy.getMoney}/${serverID}/${user.id}`);
            const result = await response.json();

            if (!response.ok) {
                embed.setDescription(`GET ${user.tag} balance\n**${result.error}** ${config.economy.symbol}`)
                    .setFooter({ text: 'Operation failed' })
                    .setColor('#ff0000');
                return message.edit({ embeds: [embed] });
            }

            if (config.RPGSTATUS === true) {
                embed.setDescription(`GET ${randomString(5)} balance`)
                    .addFields({
                        name: `${config.assets.emoji.wallet} Balance`,
                        value: `**${randomString(30)}** ${config.economy.symbol}`,
                        inline: true
                    })
                    .setFooter({ text: 'End-Of-Packet' })
                    .setColor('#00ff00');
                } else {


            embed.setDescription(`GET ${user.tag} balance`)
                .addFields({
                    name: `${config.assets.emoji.wallet} Balance`,
                    value: `**${result.money}** ${config.economy.symbol}`,
                    inline: true
                })
                .setFooter({ text: 'End-Of-Packet' });
            }

            await message.edit({ embeds: [embed] });

        } catch (error) {
            logger.logError(error, {
                commandName: 'shop',
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                timestamp: new Date().toISOString()
            });
            console.error('Error fetching balance:', error);
            return interaction.editReply({
                content: '```bash\nAn error occurred while fetching balance. Please try again.```',
                ephemeral: true
            });
        }
    }
};