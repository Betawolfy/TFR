const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

// Read and parse the shop.json file
const shopFilePath = path.join(__dirname, '../../data/shop.json');
const shopData = JSON.parse(fs.readFileSync(shopFilePath, 'utf8'));

const commandBuilder = new SlashCommandBuilder()
    .setName('buy')
    .setDescription('PUT Buy')
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
    });

module.exports = {
    data: commandBuilder,
    async execute(interaction) {
        const itemName = interaction.options.getString('item');
        const userId = interaction.user.id;
        const fetch = (await import('node-fetch')).default;

        try {
            const response = await fetch(`http://localhost:${config.port}/api/buy`, {
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

            const item = result.item;
            const embed = new EmbedBuilder()
                .setTitle(`${config.errorCode[200].emoji} • Shop.Buy`)
                .setDescription(`SYSTEM DELETE **${item.price}**${config.economy.symbol} from ${interaction.user}.balance and PUT**${item.name}** in ${interaction.user}.inventory .`)
                .setColor(randomColor);

            await interaction.reply({ embeds: [embed], ephemeral: false });
            await interaction.followUp({ content: 'Purchase successful! \n If you bought a color pack or an addon, you can use it by using the /use command.', ephemeral: true });
            return;
        } catch (error) {
            console.error('Error processing purchase:', error);
            return interaction.reply({ content: 'Error processing purchase!', ephemeral: true });
        }
    }
};