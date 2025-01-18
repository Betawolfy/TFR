const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

const commandBuilder = new SlashCommandBuilder()
    .setName('use')
    .setDescription('Use an item from your inventory')
    .addStringOption(option => 
        option.setName('item')
            .setDescription('The name of the item to use')
            .setRequired(true)
    );

module.exports = {
    data: commandBuilder,
    async execute(interaction) {
        const itemName = interaction.options.getString('item');
        const userId = interaction.user.id
        const fetch = (await import('node-fetch')).default;;

        try {
            const response = await fetch(`http://localhost:${config.port}/api/use`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, itemName })
            });

            const result = await response.json();

            if (!response.ok) {
                return interaction.reply({ content: result.error, ephemeral: true });
            }

            const colors = [0x0f135c, 0x282692, 0x107bb8, 0xe07d37, 0xcf2341];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const useEmbed = new EmbedBuilder()
                .setTitle(`${config.errorCode[200].emoji} • User.Inventory.Use`)
                .setDescription(`**${itemName}**.\nYou can now open a ticket to claim your item!`)
                .setColor(randomColor);

            const button = new ButtonBuilder()
                .setCustomId('claim_item_channel')
                .setLabel('Open claim item channel')
                .setStyle('Primary');

            const row = new ActionRowBuilder()
                .addComponents(button);

            await interaction.reply({ embeds: [useEmbed], components: [row], ephemeral: true });
            return;
        } catch (error) {
            console.error('Error using item:', error);
            return interaction.reply({ content: 'Error using item!', ephemeral: true });
        }
    }
};