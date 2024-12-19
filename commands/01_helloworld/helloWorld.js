const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello-world')
        .setDescription('Says hello to the world.'),
    async execute(interaction) {
        const lines = [
            "Never gonna give you up",
            "Never gonna let you down",
            "Never gonna run around and desert you",
            "Never gonna make you cry",
            "Never gonna say goodbye",
            "Never gonna tell a lie and hurt you"
        ];

        const delays = [
            1000,
            1000,
            1000,
            1000,
            1000,
            1000
        ]; // Delays in milliseconds

        await interaction.reply(lines[0]);

        for (let i = 1; i < lines.length; i++) {
            await new Promise(resolve => setTimeout(resolve, delays[i]));
            await interaction.editReply(lines[i]);
        }
    },
};