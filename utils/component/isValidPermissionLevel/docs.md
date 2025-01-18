# Permission Level Validation Documentation

## Description
Ce module fournit un ensemble de fonctions pour gérer les niveaux de permission dans une application Discord.js.

## Installation
```javascript
const { 
    isValidPermissionLevel, 
    permissionLevelToNumber,
    hasPermissionLevel,
    hasRolePermissionLevel,
    getHighestUserRole 
} = require('./utils/validation/isValidPermissionLevel');
```

## Niveaux de Permission
Les niveaux de permission sont hiérarchisés comme suit :

| Niveau | Valeur | Description |
|--------|---------|-------------|
| ADMIN | 4 | Accès complet |
| MODERATOR | 3 | Accès modération |
| HELPER | 2 | Accès support |
| MEMBER | 1 | Accès basique |
| GUEST | 0 | Accès limité |

## Fonctions

### isValidPermissionLevel(level, config)

- Vérifie si un niveau de permission est valide.

**Paramètres :**
- level
(string) : Le niveau de permission à vérifier

- config
(Object) : Configuration contenant les rôles valides

**Retourne :** `boolean`

```javascript
const isValid = isValidPermissionLevel('ADMIN', config);
```

### permissionLevelToNumber(level)


Convertit un niveau de permission en valeur numérique.

**Paramètres :**

- level (string) : Le niveau de permission

**Retourne :** 

number (0-4)

```javascript
const levelValue = permissionLevelToNumber('MODERATOR'); // 3
```

### hasPermissionLevel(userLevel, requiredLevel)


Vérifie si un niveau utilisateur est suffisant pour le niveau requis.

**Paramètres :**

- userLevel (string) : Niveau de l'utilisateur

- requiredLevel (string) : Niveau requis

**Retourne :** `boolean`

```javascript
const hasAccess = hasPermissionLevel('ADMIN', 'MODERATOR'); // true
```

### hasRolePermissionLevel(member, requiredLevel, config)


Vérifie si un membre Discord a le rôle requis.

**Paramètres :**

- member (GuildMember) : Membre Discord

- requiredLevel (string) : Niveau requis

- config (Object) : Configuration

**Retourne :** `boolean`

```javascript
const hasRole = hasRolePermissionLevel(member, 'ADMIN', config);
```

### getHighestUserRole(member, config)

Obtient le plus haut niveau de permission d'un membre.

**Paramètres :**

- member (GuildMember) : Membre Discord

- config (Object) : Configuration

**Retourne :** `string` (niveau de permission)

```javascript
const highestRole = getHighestUserRole(member, config);
```

## Configuration Requise
Le module nécessite un objet de configuration avec la structure suivante :

```json
{
    "permissions": {
        "roles": {
            "ADMIN": "roleId",
            "MODERATOR": "roleId",
            "HELPER": "roleId",
            "MEMBER": "roleId",
            "GUEST": "roleId"
        },
        "staff": ["roleId"]
    }
}
```

## Exemple d'Utilisation

```javascript
const { isValidPermissionLevel, hasPermissionLevel } = require('./utils/validation/isValidPermissionLevel');
const config = require('./config.json');

// Vérification d'une commande
async function executeCommand(interaction) {
    const member = interaction.member;
    const requiredLevel = 'MODERATOR';

    if (!hasRolePermissionLevel(member, requiredLevel, config)) {
        return interaction.reply('Permission insuffisante !');
    }

    // Exécution de la commande...
}
```

## Notes
- Les niveaux de permission sont case-insensitive
- Si un niveau n'est pas reconnu, il est considéré comme GUEST (0)
- La vérification inclut les rôles personnalisés définis dans la configuration