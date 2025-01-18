// setStatus.js

/* setStatus is a command that allows person with the permissions ADMIN to edit the RPG status of the bot.

the Status of the bot is defined by adding a variable in config.json named "RPGSTATUS". 
This var is a boolean var (only 0 or 1).

If the var is 1 (enabled), the bot is hacked, and instead of displaying correct information, it will display fake/corrupted information.
If the var is 0 (disabled), the bot is not hacked and will display correct information.

This command forces the status changement, like a toogle button.
*/

// Dependencies
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');
const { hasRolePermissionLevel, getHighestUserRole } = require('../../utils/component/isValidPermissionLevel/isValidPermissionLevel');
const EmbedHelper = require('../../utils/component/embedHelper/embedHelper');
const LogCreator = require('../../utils/component/logCreator/logCreator');
const logger = new LogCreator();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-status')
        .setDescription('POST setStatus')
        .addBooleanOption(option => option
            .setName('status')
            .setDescription('Args_00 status')
            .setRequired(true)),

    async execute(interaction) {
        logger.logCommand(interaction, { customArg: 'customValue' });
        // Check permissions
        const highestRole = getHighestUserRole(interaction.member, config);
        if (highestRole !== 'ADMIN' && !hasRolePermissionLevel(interaction.member, 'MODERATOR', config)) {
            const errorEmbed = EmbedHelper.createErrorEmbed(
                "You need a higher permission level to use this command. Required level: `MODERATOR`, `ADMIN`.",
                "403"
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            const status = interaction.options.getBoolean('status');

            // Change the status
            config.RPGSTATUS = status;
            fs.writeFileSync(path.resolve(__dirname, '../../config.json'), JSON.stringify(config, null, 4));

            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ post-status --status ${status}`)
                .setDescription('var has been changed.' + '\n')
                .setAuthor({ name: 'Admin', iconURL: config.server.icon })
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Latency: ${Date.now() - interaction.createdTimestamp}ms` });

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            logger.logCommand(interaction, {
                commandType: 'POST',
                target: 'status',
                status: 'failed',
                error: error
            });

            const errorEmbed = EmbedHelper.createErrorEmbed(
                "An error occurred while executing this command. Please try again.",
                "500"
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};