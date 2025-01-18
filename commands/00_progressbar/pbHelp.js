const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pb-help')
        .setDescription('Shows help for the progress bar game.'),
    async execute(interaction) {
        const colors = [0x0f135c, 0x282692, 0x107bb8, 0xe07d37, 0xcf2341];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const BlueFragment = '<:pb95_BlueSegment:1329749971750223894>';
        const CyanFragment = '<:pb95_CyanSegment:1329750001244704778>';
        const YellowFragment = '<:pb95_YellowSegment:1329750021767299116>';
        const PinkFragment = '<:pb95_PinkSegment:1329750063882436672>';
        const RedFragment = '<:pb95_RedSegment:1329750044127002674>';
        const dog = '<:bonusFromTheDog:1329750137282625628>';
        const Clippy = '<:pb95_Clippy:1329750112011944039>';

        const embed = new EmbedBuilder()
            .setTitle(`Progress Bar Help`)
            .setAuthor({ name: `Clippy`, iconURL: "https://cdn.discordapp.com/emojis/1319573664861126657.webp?size=32&quality=lossless"})
            .setThumbnail('https://cdn.discordapp.com/emojis/1319601080560128041.webp?size=128&quality=lossless')
            .setDescription(`
                **1. Bacics**
                *Progressbar95 is a unique nostalgic game. It'll make you smile. Remember your first gaming computer!* -IconEye, Developer of Progressbar95.
                Progressbar95 is a Hypercasual game where you need to catch fragments to fill your progress bar. The game is inspired by the old Windows 95 UI and the "progressbar95" game by IconEye.
                
                **2. How to Play**
                To play the game, type \`/pb-start\` to start the game.
                The interface will be a embed with an empty progress bar and the progress.
                To fill your progress bar, you need to catch fragments. There is many varients of fragments (see in III. Fragments and In-game events).
                In order to win the game, you need to fill the progress bar to 100% (or... more??).
                
                **3. Fragments and In-game events**
                There is 4 Types of fragments:
            `)
            .setColor(randomColor)
            .setFooter({ text: `Progressbar95 • Progress Bar Help` })
            .setTimestamp();

        const fragments = [
            { name: `${BlueFragment} Blue Fragment`, value: 'The blue fragment is the most common fragment. It fills the progress bar by 5%.' },
            { name: `${CyanFragment} Cyan Fragment`, value: 'The cyan fragment is a bit rare. It fills the progress bar by 10%.' },
            { name: `${YellowFragment} Yellow Fragment`, value: 'The yellow fragment is a corrupted fragment. It fills the progress bar by 5% but it is recommanded to avoid them.' },
            { name: `${PinkFragment} Pink Fragment`, value: 'The pink fragment is a DELETE call. It remove your latest added fragment (and 5% of the progress bar).' },
            { name: `${RedFragment} Red Fragment`, value: 'The red fragment is a PTIOH fragment. If you grab it, the system will stop, and it\'s game over.' },
            { name: `${dog} Dog Fragment`, value: 'Dog (Or Bonus), it\'s a bonus fragment. It fills the progress bar by 10%.' }
        ];

        fragments.forEach(fragment => {
            embed.addFields({ name: fragment.name, value: fragment.value, inline: false });
        });

        await interaction.reply({ embeds: [embed] });
    }
};