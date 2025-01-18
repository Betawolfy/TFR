const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../../config.json');

// Read and parse the shop.json file
const shopFilePath = path.join(__dirname, '../../data/shop.json');
const shopData = JSON.parse(fs.readFileSync(shopFilePath, 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop-edit')
        .setDescription('PUT EditShop')
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
        })
        .addStringOption(option => option
            .setName('value')
            .setDescription('Args_01 value')
            .setRequired(true)
            .addChoices(
                { name: 'Name', value: 'name' },
                { name: 'Description', value: 'description' },
                { name: 'Price', value: 'price' }
            )
        )
        .addStringOption(option => option
            .setName('new_value')
            .setDescription('Args_02 new_value')
            .setRequired(true)),
    async execute(interaction) {
        const commandAuthor = interaction.user.id;
        const itemName = interaction.options.getString('item'); // Corrected line
        const value = interaction.options.getString('value');
        const newValue = interaction.options.getString('new_value');
        const serverID = interaction.guild.id;
        
        // check if the user is an admin or a shop handler
        const ownerRoleID = config.permissions.owner;
        const coOwnerRoleID = config.permissions.coOwner;
        const adminRoleID = config.permissions.admin;
        if (!interaction.member.roles.cache.has(ownerRoleID) && !interaction.member.roles.cache.has(coOwnerRoleID) && !interaction.member.roles.cache.has(adminRoleID)) {
            return interaction.reply({ content: `${config.errorCode[403].title} ${config.errorCode[403].description}`, ephemeral: true });
        }

        console.log('Command execution started');
        console.log(`Received command from user: ${commandAuthor}, server: ${serverID}, item: ${itemName}, value: ${value}, newValue: ${newValue}`);

        async function editItem(itemName, value, newValue, interaction) {
            let shop = [];
            try {
                const response = await fetch(`http://localhost:${config.port}/api/shop`);
                shop = await response.json();
            } catch (error) {
                console.error('Error fetching shop:', error);
                await interaction.reply({ content: 'Error fetching shop!', ephemeral: true });
                return;
            }

            const item = shop.find(item => item.name === itemName);
            if (!item) {
                await interaction.reply({ content: `Item with name \`${itemName}\` not found!`, ephemeral: true });
                return;
            }

            switch (value) {
                case 'name':
                    item.name = newValue;
                    break;
                case 'description':
                    item.description = newValue;
                    break;
                case 'price':
                    item.price = newValue;
                    break;
                default:
                    await interaction.reply({ content: `Invalid value to edit: \`${value}\`. Valid values: name, description, price, emoji`, ephemeral: true });
                    return;
            }

            try {
                const response = await fetch(`http://localhost:${config.port}/api/shop/${itemName}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(item)
                });
                const updatedItem = await response.json();
                await interaction.reply({ content: `Item \`${updatedItem.name}\` updated!`, ephemeral: true });
            } catch (error) {
                console.error('Error updating item:', error);
                await interaction.reply({ content: 'Error updating item!', ephemeral: true });
            }
        }

        editItem(itemName, value, newValue, interaction);

        // Execute deploy.js
        exec('node deploy.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing deploy.js: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    }
};