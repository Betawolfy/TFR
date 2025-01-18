/* eslint-disable no-undef */
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

// Read and parse the items.json file
const itemsFilePath = path.join(__dirname, '../../data/items.json');
const itemEmojis = JSON.parse(fs.readFileSync(itemsFilePath, 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View the inventory of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view the inventory of')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const fetch = (await import('node-fetch')).default;

        try {
            const response = await fetch(`http://localhost:${config.port}/api/inventory?userId=${user.id}`);
            const result = await response.json();

            if (!response.ok) {
                return interaction.reply({ content: result.error, ephemeral: true });
            }

            const colors = [0x00a0ff, 0xffb900, 0xff7900, 0x291326, 0x6b1111];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // Aggregate items by name
            const itemMap = result.inventory.reduce((acc, item) => {
                const itemName = item.used ? `${item.name} (used)` : item.name;
                if (!acc[itemName]) {
                    acc[itemName] = { count: 0, date: item.date };
                }
                acc[itemName].count += 1;
                if (new Date(item.date) > new Date(acc[itemName].date)) {
                    acc[itemName].date = item.date;
                }
                return acc;
            }, {});

            const inventory = Object.entries(itemMap).length > 0
                ? Object.entries(itemMap).map(([name, { count, date }]) => {
                    const emoji = itemEmojis[name] || '';
                    return `**${emoji} ${name}** x${count}`;
                }).join('\n')
                : 'No items';

            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s Inventory`)
                .setDescription(inventory)
                .setColor(randomColor);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching inventory:', error);
            return interaction.reply({ content: 'Error fetching inventory!', ephemeral: true });
        }
    }
};