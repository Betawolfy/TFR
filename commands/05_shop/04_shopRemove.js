const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');
const { exec } = require('child_process');
const randomColor = require('../../utils/randomizers/randomColor');

// Read and parse the shop.json file
const shopFilePath = path.join(__dirname, '../../data/shop.json');
const shopData = JSON.parse(fs.readFileSync(shopFilePath, 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop-delete')
        .setDescription('DELETE RemoveShop')
        .addStringOption(option => {
            option.setName('item')
                .setDescription('Args_00 item')
                .setRequired(true)
                .addChoices(
                    ...shopData.map(item => ({
                        name: `${item.name}`,
                        value: item.name
                    }))
                );
            return option;
        }),
    async execute(interaction) {
        const itemName = interaction.options.getString('item');
        const fetch = (await import('node-fetch')).default;

        // Permission check
        const adminRoleID = config.permissions.admin;
        const shopHandlerRoleID = config.permissions.shopHandler;

        if (!interaction.member.roles.cache.has(adminRoleID) && !interaction.member.roles.cache.has(shopHandlerRoleID)) {
            return interaction.reply({ content: `${config.errorCode[403].title} ${config.errorCode[403].description}`, ephemeral: true });
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle(`[user@tfr-server]~$ delete-shop --item "${itemName}"`)
                .setDescription('DELETEing item from shop...')
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

            const response = await fetch(`http://localhost:${config.port}/api/remove-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemName })
            });

            const result = await response.json();

            if (!response.ok) {
                embed.setDescription('ERROR: Failed to remove item')
                    .setFooter({ text: 'Operation failed' })
                    .setColor('#ff0000');
                return await message.edit({ embeds: [embed] });
            }

            // Execute deploy.js
            exec('node deploy.js', (error, stdout, stderr) => {
                if (error) console.error(`Error executing deploy.js: ${error.message}`);
                if (stderr) console.error(`stderr: ${stderr}`);
            });

            embed.setDescription(`DELETE shop item "${itemName}"`)
                .setFooter({ text: 'End-Of-Packet' })
                .addFields({
                    name: 'Status',
                    value: `Successfully removed **${itemName}** from the shop.`,
                    inline: true
                });

            await message.edit({ embeds: [embed] });

        } catch (error) {
            console.error('Error:', error);
            await interaction.editReply({
                content: '```bash\nAn error occurred while removing the item. Please try again.```',
                ephemeral: true
            });
        }
    }
};