const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');
const lang = require('../../lang/pb.json');
const fs = require('fs');
const path = require('path');
const { text } = require('stream/consumers');
const { title } = require('process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pb-start')
        .setDescription('Play the ProgressBar game'),
    async execute(interaction) {
        let progress = 0;
        let gameActive = true;

        // Fragments and emojis
        const BlueFragment = '<:pb95_BlueSegment:1329749971750223894>';
        const CyanFragment = '<:pb95_CyanSegment:1329750001244704778>';
        const YellowFragment = '<:pb95_YellowSegment:1329750021767299116>';
        const PinkFragment = '<:pb95_PinkSegment:1329750063882436672>';
        const RedFragment = '<:pb95_RedSegment:1329750044127002674>';
        const dog = '<:bonusFromTheDog:1329749879651831879>';
        const Clippy = '<:pb95_Clippy:1329750112011944039>';
        const GameOverComp = '<:pb95_GameOver:1329750082744221768>';

        const fragments = [BlueFragment, CyanFragment, YellowFragment, PinkFragment, RedFragment];

        let fragmentStack = [];
        const filter = m => m.author.id === interaction.user.id;

        // Initial fragment
        let currentFragment = fragments[Math.floor(Math.random() * fragments.length)];
        let progressBarMap = new Map();

        // Function to generate the progress bar
        const generateProgressBar = (progressBarMap) => {
            let progressBar = '';
            progressBarMap.forEach((count, fragment) => {
                progressBar += fragment.repeat(count);
            });
            const totalSegments = 20;
            const filledSegments = Array.from(progressBarMap.values()).reduce((a, b) => a + b, 0);
            const emptySegments = totalSegments - filledSegments;
            return `${progressBar}${'░'.repeat(emptySegments)}`;
        };

        // Bonus from the dog
        const dogBonus = (progressBarMap) => {
            let lastFragment = '';
            let count = 0;
            for (const fragment of fragmentStack) {
                if (fragment === lastFragment) {
                    count++;
                    if (count === 3) {
                        progress += 5;
                        if (progressBarMap.has(fragment)) {
                            progressBarMap.set(fragment, progressBarMap.get(fragment) + 1);
                            interaction.channel.send(lang.dogBonusMessage.replace('{dog}', dog));
                        } else {
                            progressBarMap.set(fragment, 1);
                        }
                        return true;
                    }
                } else {
                    lastFragment = fragment;
                    count = 1;
                }
            }
            return false;
        }

        // Popups
        /* Randoms text that will display randomly like a fragment.
        The user has to type a random given number/letter pattern to close the popup.
        */
        const popups = [
            {
                title: '4Paws',
                text: 'You have a new message from Clippy! Type "close" to close it.',
                pattern: 'close',
                penalty: 5
            },
            {
                title: 'Annoying popup',
                text: 'Introducing: Blue light verity! The cool mobile game! Type "close" to close it.',
                pattern: 'close',
                penalty: 5
            },
            {
                title: 'Your antivirus, trust me bro :3',
                text: 'Warning: Your computer might be at risk! Type "scan" to run antivirus.',
                pattern: 'scan',
                penalty: 5
            },
            {
                title: 'New update available',
                text: 'New update available! Type "later" to dismiss.',
                pattern: 'later',
                penalty: 3
            },
            {
                title: 'Annoying popup',
                text: 'You won a free gift card! Type "close" to close.',
                pattern: 'close',
                penalty: 7
            },
            {
                title: 'MARRIAGE ANNOUCEMENT!!!',
                text: `You are invited to Rayne and ` + interaction.user.username + `'s wedding! Type "accept" to accept the invitation.`,
                pattern: 'accept',
                penalty: 10
            },
            {
                title: 'the lorem king',
                text: 'Lorem ipsum dolor sit amet, audaces fortuna juvat. fortuna tua te non deserat.. Type "close" to close.',
            }
            
        ];

        const handlePopup = async (interaction, filter) => {
            if (Math.random() < 0.2) {
                const popup = popups[Math.floor(Math.random() * popups.length)];

                // Sauvegarder l'embed original
                const originalEmbed = { ...embed };

                // Créer l'embed du popup
                embed.title = "Windows 95";
                embed.description = `${Clippy} ${popup.text}`;

                // Mettre à jour l'affichage avec le popup
                await interaction.editReply({ embeds: [embed] });

                const collected = await interaction.channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 10000
                });

                if (!collected.size || collected.first().content.toLowerCase() !== popup.pattern) {
                    progress -= popup.penalty;
                    if (progress < 0) progress = 0;

                    // Restaurer l'embed avec la pénalité
                    embed.title = originalEmbed.title;
                    embed.description = lang.progressDescription
                        .replace('{progressBar}', generateProgressBar(progressBarMap))
                        .replace('{progress}', progress)
                        .replace('{currentFragment}', currentFragment);
                    await interaction.editReply({ embeds: [explainationEmbed, embed] });
                    return true;
                }

                // Supprimer la réponse de l'utilisateur
                await collected.first().delete();

                // Restaurer l'embed original
                embed.title = originalEmbed.title;
                embed.description = originalEmbed.description;
                await interaction.editReply({ embeds: [explainationEmbed, embed] });
                return false;
            }
            return false;
        };

        // Initial embed message
        const embed = {
            title: lang.gameTitle,
            description: lang.progressDescription.replace('{progressBar}', generateProgressBar(progressBarMap)).replace('{progress}', progress).replace('{currentFragment}', currentFragment)
        };

        const explainationEmbed = {
            author: lang.explanationEmbed.author,
            description: lang.explanationEmbed.description.replace('{BlueFragment}', BlueFragment).replace('{CyanFragment}', CyanFragment).replace('{YellowFragment}', YellowFragment).replace('{PinkFragment}', PinkFragment).replace('{RedFragment}', RedFragment),
            footer: lang.explanationEmbed.footer
        };

        await interaction.reply({ embeds: [embed, explainationEmbed] });

        // Game loop
        while (gameActive && progress < 100) {
            const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
            if (!collected.size) {
                gameActive = false;
                embed.description = lang.gameOverTimeRanOut.replace('{Clippy}', Clippy);
                await interaction.editReply({ embeds: [embed] });
                break;
            }

            const response = collected.first();
            await response.delete();

            const popupActive = await handlePopup(interaction, filter);
            if (popupActive) {
                currentFragment = fragments[Math.floor(Math.random() * fragments.length)];
                embed.description = lang.progressDescription
                    .replace('{progressBar}', generateProgressBar(progressBarMap))
                    .replace('{progress}', progress)
                    .replace('{currentFragment}', currentFragment);
                await interaction.editReply({ embeds: [embed] });
                continue;
            }

            if (response.content.toLowerCase() === 'quit') {
                await interaction.channel.send(lang.quitMessage.replace('{Clippy}', Clippy).replace('{dog}', dog));
                gameActive = false;
                break;
            }

            if (response.content.toLowerCase() === 'grab') {
                if (currentFragment === BlueFragment) {
                    console.log(lang.safeFragmentMessage);
                    progress += 5;
                    if (progressBarMap.has(currentFragment)) {
                        progressBarMap.set(currentFragment, progressBarMap.get(currentFragment) + 1);
                    } else {
                        progressBarMap.set(currentFragment, 1);
                    }
                    fragmentStack.push(currentFragment);
                } else if (currentFragment === CyanFragment) {
                    progress += 10;
                    if (progressBarMap.has(BlueFragment)) {
                        progressBarMap.set(BlueFragment, progressBarMap.get(BlueFragment) + 2);
                    } else {
                        progressBarMap.set(BlueFragment, 2);
                    }
                    fragmentStack.push(BlueFragment);
                } else if (currentFragment === YellowFragment) {
                    progress += 5;
                    if (progressBarMap.has(currentFragment)) {
                        progressBarMap.set(currentFragment, progressBarMap.get(currentFragment) + 1);
                    } else {
                        progressBarMap.set(currentFragment, 1);
                    }
                    fragmentStack.push(currentFragment);
                } else if (currentFragment === PinkFragment) {
                    progress -= 5;
                    if (progress < 0) {
                        progress = 0;
                    }
                    if (fragmentStack.length > 0) {
                        const lastFragment = fragmentStack.pop();
                        if (progressBarMap.has(lastFragment)) {
                            const currentCount = progressBarMap.get(lastFragment);
                            if (currentCount > 1) {
                                progressBarMap.set(lastFragment, currentCount - 1);
                            } else {
                                progressBarMap.delete(lastFragment);
                            }
                        }
                    }
                } else if (currentFragment === RedFragment) {
                    console.log(lang.dangerousFragmentMessage);
                    await interaction.channel.send(lang.dangerousFragmentMessage.replace('{GameOverComp}', GameOverComp));
                    gameActive = false;
                    break;
                }

                currentFragment = fragments[Math.floor(Math.random() * fragments.length)];
            } else {
                currentFragment = fragments[Math.floor(Math.random() * fragments.length)];
            }

            embed.description = lang.progressDescription.replace('{progressBar}', generateProgressBar(progressBarMap)).replace('{progress}', progress).replace('{currentFragment}', currentFragment);
            await interaction.editReply({ embeds: [explainationEmbed, embed] });
        }

        if (progress >= 100 && progressBarMap.size === 1 && progressBarMap.has(BlueFragment)) {
            await interaction.channel.send(lang.perfectistMessage);
        }

        if (progress >= 100 && progressBarMap.size === 1 && progressBarMap.has(YellowFragment)) {
            await interaction.channel.send(lang.corruptedMessage);
        }

        if (progress >= 100 && progressBarMap.size === 2 && progressBarMap.has(YellowFragment) && progressBarMap.has(BlueFragment)) {
            if (progressBarMap.get(YellowFragment) === progressBarMap.get(BlueFragment)) {
                await interaction.channel.send(lang.balancedMessage);
            } else {
                await interaction.channel.send(lang.zebraMessage);
            }
        }

        // Increase Deltaz's happiness if the game is won
        // if (progress >= 100) {
        //     const deltazData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/deltaz/deltaz.json')));
        //     deltazData.happiness = Math.min(deltazData.happiness + 10, 100); // Increase happiness by 10, max 100
        //     fs.writeFileSync(path.join(__dirname, '../../data/deltaz/deltaz.json'), JSON.stringify(deltazData, null, 4));
        //     await interaction.channel.send('Deltaz is happier now!');
        // }

        embed.description = gameActive ? lang.winMessage : lang.gameOverMessage;
        await interaction.editReply({ embeds: [embed] });
    },
};