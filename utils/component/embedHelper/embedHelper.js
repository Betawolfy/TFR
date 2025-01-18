// embedHelper.js
const { EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

class EmbedHelper {
    /**
     * Crée un embed de base avec le style du serveur
     * @param {string} title - Titre de l'embed
     * @param {string} description - Description de l'embed
     * @param {number} color - Couleur en hexadécimal (optionnel)
     */
    static createBasicEmbed(title, description, color = 0xFFFFFF) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ 
                text: config.server.name, 
                iconURL: config.server.icon 
            });
    }

    /**
     * Crée un embed d'erreur
     * @param {string} error - Message d'erreur
     * @param {string} code - Code d'erreur (optionnel)
     */
    static createErrorEmbed(error, code = '500') {
        const errorConfig = config.errorCode[code];
        return this.createBasicEmbed(
            `${config.assets.emoji.error} ${errorConfig?.title || 'Error'}`,
            error,
            0xFF0000
        );
    }

    /**
     * Crée un embed de succès
     * @param {string} message - Message de succès
     */
    static createSuccessEmbed(message) {
        return this.createBasicEmbed(
            `${config.assets.emoji.check} Success`,
            message,
            0x00FF00
        );
    }

    /**
     * Crée un embed d'avertissement
     * @param {string} message - Message d'avertissement
     */
    static createWarningEmbed(message) {
        return this.createBasicEmbed(
            `${config.assets.emoji.warn} Warning`,
            message,
            0xFFA500
        );
    }

    /**
     * Crée un embed pour l'économie
     * @param {string} title - Titre de l'embed
     * @param {string} description - Description de l'embed
     */
    static createEconomyEmbed(title, description) {
        return this.createBasicEmbed(
            `${config.assets.emoji.wallet} ${title}`,
            `${description} ${config.economy.symbol}`,
            0x00A0FF
        );
    }

    /**
     * Crée un embed pour l'expérience
     * @param {string} title - Titre
     * @param {string} description - Description
     */
    static createExpEmbed(title, description) {
        return this.createBasicEmbed(
            `${config.assets.emoji.exp} ${title}`,
            `${description} ✨`,
            0xFFFFFF
        );
    }
}

module.exports = EmbedHelper;