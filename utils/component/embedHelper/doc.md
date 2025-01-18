# Documentation EmbedHelper

## Description


EmbedHelper est une classe utilitaire qui facilite la création d'embeds Discord standardisés pour votre serveur.

## Installation
```javascript
const EmbedHelper = require('./utils/component/embedHelper/embedHelper.js');
```

## Configuration Requise
Le module nécessite un fichier `config.json` avec la structure suivante:

```javascript
{
    "server": {
        "name": "Nom du serveur",
        "icon": "URL de l'icône"
    },
    "assets": {
        "emoji": {
            "error": "emoji_erreur",
            "check": "emoji_succès",
            "warn": "emoji_avertissement",
            "wallet": "emoji_portefeuille",
            "exp": "emoji_expérience"
        }
    },
    "economy": {
        "symbol": "symbole_monnaie"
    },
    "errorCode": {
        "500": {
            "title": "Titre erreur",
            "description": "Description erreur"
        }
        // ... autres codes d'erreur
    }
}
```

## Méthodes

### createBasicEmbed(title, description, color)
Crée un embed de base avec le style du serveur.

**Paramètres:**
- title
(string): Titre de l'embed

- description
(string): Description de l'embed

- color
(number, optionnel): Couleur en hexadécimal (défaut: 0xFFFFFF)

```javascript
const basicEmbed = EmbedHelper.createBasicEmbed(
    "Titre",
    "Description",
    0xFF0000
);
```

### createErrorEmbed(error, code)
Crée un embed d'erreur.

**Paramètres:**
- error
(string): Message d'erreur
- code
(string, optionnel): Code d'erreur (défaut: '500')

```javascript
const errorEmbed = EmbedHelper.createErrorEmbed(
    "Une erreur est survenue",
    "403"
);
```

### createSuccessEmbed(message)
Crée un embed de succès.

**Paramètres:**
- message
(string): Message de succès

```javascript
const successEmbed = EmbedHelper.createSuccessEmbed(
    "Opération réussie!"
);
```

### createWarningEmbed(message)


Crée un embed d'avertissement.

**Paramètres:**
- message
(string): Message d'avertissement

```javascript
const warningEmbed = EmbedHelper.createWarningEmbed(
    "Attention!"
);
```

### createEconomyEmbed(title, description)
Crée un embed pour l'économie.

**Paramètres:**
- title
(string): Titre de l'embed

- description
(string): Description de l'embed

```javascript
const economyEmbed = EmbedHelper.createEconomyEmbed(
    "Balance",
    "1000"
);
```

### createExpEmbed(title, description)
Crée un embed pour l'expérience.

**Paramètres:**
- title
(string): Titre

- description
(string): Description

```javascript
const expEmbed = EmbedHelper.createExpEmbed(
    "Niveau",
    "+100"
);
```

## Exemple d'Utilisation Complet

```javascript
const EmbedHelper = require('./utils/component/embedHelper/embedHelper.js');

async function handleCommand(interaction) {
    try {
        // Embed de succès
        const successEmbed = EmbedHelper.createSuccessEmbed(
            "Commande exécutée avec succès!"
        );
        await interaction.reply({ embeds: [successEmbed] });
        
    } catch (error) {
        // Embed d'erreur en cas d'échec
        const errorEmbed = EmbedHelper.createErrorEmbed(
            error.message,
            "500"
        );
        await interaction.reply({ 
            embeds: [errorEmbed],
            ephemeral: true 
        });
    }
}
```

## Couleurs Par Défaut
- Basic: `0xFFFFFF` (Blanc)
- Error: `0xFF0000` (Rouge)
- Success: `0x00FF00` (Vert)
- Warning: `0xFFA500` (Orange)
- Economy: `0x00A0FF` (Bleu clair)
- Experience: `0xFFFFFF` (Blanc)

## Notes
- Tous les embeds incluent automatiquement le nom et l'icône du serveur en pied de page
- Les emojis sont automatiquement ajoutés depuis la configuration
- Les codes d'erreur personnalisés peuvent être définis dans la configuration